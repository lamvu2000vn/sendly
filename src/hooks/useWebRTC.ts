import { useCallback, useRef, useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { generateCode, sendSignal, pollSignal } from '@/lib/signaling';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { saveChunk, clearStorage, getBlobFromStorage } from '@/lib/fileStorage';

const DEFAULT_CHUNK_SIZE = 16 * 1024; // 16 KB
const MAX_CHUNK_SIZE = 64 * 1024; // 64 KB
const SEND_OFFER_DELAY = 3000;
const POLL_INTERVAL = 2000;

export interface FileTransfer {
    id: string;
    fileName: string;
    fileSize: number;
    progress: number;
    status: 'pending' | 'transferring' | 'completed' | 'error';
    objectUrl?: string;
}

export interface TransferState {
    files: FileTransfer[];
    isReceiving: boolean;
}

export function useWebRTC() {
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const dcRef = useRef<RTCDataChannel | null>(null);
    const resumeRef = useRef<(() => void) | null>(null);
    const {
        connectionStatus,
        setConnectionStatus,
        connectionCode,
        setConnectionCode,
        mode,
        setMode,
    } = useAppStore();
    const [transferState, setTransferState] = useState<TransferState | null>(
        null,
    );
    const transferFilesRef = useRef<FileTransfer[]>([]);

    useEffect(() => {
        transferFilesRef.current = transferState?.files || [];
    }, [transferState]);

    const currentFileRef = useRef<{
        id: string;
        name: string;
        size: number;
        received: number;
    } | null>(null);
    const lastUpdateRef = useRef<number>(0);

    const cleanup = useCallback(() => {
        pcRef.current?.close();
        pcRef.current = null;
        dcRef.current = null;
        clearStorage().catch(console.error);
    }, []);

    const checkIsReceiveComplete = useCallback(() => {
        const currentMode = useAppStore.getState().mode;
        return (
            currentMode === 'receiver' &&
            transferFilesRef.current.length > 0 &&
            transferFilesRef.current.every((f) => f.status === 'completed')
        );
    }, []);

    const setupDataChannel = useCallback(
        (channel: RTCDataChannel) => {
            channel.onopen = () => {
                setConnectionStatus('connected');
                toast.success('Đã kết nối thành công!');
            };
            channel.onclose = () => {
                if (checkIsReceiveComplete()) {
                    toast.info(
                        'Người gửi đã ngắt kết nối. Bạn vẫn có thể truy cập các file đã nhận.',
                    );
                } else {
                    setConnectionStatus('disconnected');
                    setTransferState(null);
                    setConnectionCode('');
                    useAppStore.getState().setMode(null);
                    toast.info('Đã ngắt kết nối.');
                }
            };
            channel.binaryType = 'arraybuffer';
            channel.bufferedAmountLowThreshold = 1024 * 1024; // 1 MB
            channel.onbufferedamountlow = () => {
                if (resumeRef.current) {
                    const resume = resumeRef.current;
                    resumeRef.current = null;
                    resume();
                }
            };
            channel.onmessage = async (event) => {
                try {
                    if (typeof event.data === 'string') {
                        const msg = JSON.parse(event.data);
                        if (msg.type === 'manifest') {
                            setTransferState((prev) => {
                                const existingFiles = prev?.files || [];
                                const newManifestFiles = msg.files;

                                // Chuyển existingFiles thành một map để tra cứu nhanh hơn và cập nhật thông tin
                                const updatedFiles = [...existingFiles];

                                newManifestFiles.forEach((newFile: any) => {
                                    const index = updatedFiles.findIndex(
                                        (f) => f.id === newFile.id,
                                    );
                                    if (index > -1) {
                                        // Cập nhật metadata nhưng giữ lại tiến trình/trạng thái hiện tại
                                        updatedFiles[index] = {
                                            ...updatedFiles[index],
                                            ...newFile,
                                        };
                                    } else {
                                        // Thêm file mới từ manifest
                                        updatedFiles.push({
                                            ...newFile,
                                            progress: 0,
                                            status: 'pending',
                                        });
                                    }
                                });

                                return {
                                    isReceiving: true,
                                    files: updatedFiles,
                                };
                            });
                        } else if (msg.type === 'file-start') {
                            currentFileRef.current = {
                                id: msg.fileId,
                                name: msg.fileName,
                                size: msg.fileSize,
                                received: 0,
                            };
                            await clearStorage(msg.fileId);
                            setTransferState((prev) => {
                                const existingFiles = prev?.files || [];
                                const index = existingFiles.findIndex(
                                    (f) => f.id === msg.fileId,
                                );

                                let updatedFiles;
                                if (index > -1) {
                                    updatedFiles = existingFiles.map((f) =>
                                        f.id === msg.fileId
                                            ? { ...f, status: 'transferring' }
                                            : f,
                                    );
                                } else {
                                    // Fallback: Nếu manifest chưa tới hoặc không có file này
                                    updatedFiles = [
                                        ...existingFiles,
                                        {
                                            id: msg.fileId,
                                            fileName: msg.fileName,
                                            fileSize: msg.fileSize,
                                            progress: 0,
                                            status: 'transferring',
                                        },
                                    ];
                                }

                                return {
                                    isReceiving: true,
                                    files: updatedFiles,
                                };
                            });
                        }
                    } else if (event.data instanceof ArrayBuffer) {
                        const file = currentFileRef.current;
                        if (!file) return;

                        await saveChunk(file.id, event.data);
                        file.received += event.data.byteLength;

                        const now = Date.now();
                        const isComplete = file.received === file.size;

                        if (isComplete || now - lastUpdateRef.current > 100) {
                            lastUpdateRef.current = now;
                            setTransferState((prev) => {
                                if (!prev) return prev;
                                return {
                                    ...prev,
                                    files: prev.files.map((f) =>
                                        f.id === file.id
                                            ? {
                                                  ...f,
                                                  progress:
                                                      (file.received /
                                                          file.size) *
                                                      100,
                                                  status: isComplete
                                                      ? 'completed'
                                                      : 'transferring',
                                              }
                                            : f,
                                    ),
                                };
                            });
                        }

                        if (isComplete) {
                            const completedFileId = file.id;
                            const blob =
                                await getBlobFromStorage(completedFileId);
                            const url = URL.createObjectURL(blob);
                            setTransferState((prev) => {
                                if (!prev) return prev;
                                return {
                                    ...prev,
                                    files: prev.files.map((f) =>
                                        f.id === completedFileId
                                            ? { ...f, objectUrl: url }
                                            : f,
                                    ),
                                };
                            });
                            toast.success(`Đã nhận: ${file.name}`);
                            if (
                                currentFileRef.current?.id === completedFileId
                            ) {
                                currentFileRef.current = null;
                            }
                        }
                    }
                } catch (error) {
                    console.error('Data channel message error', error);
                    toast.error('Lỗi khi nhận dữ liệu. Vui lòng thử lại.');
                }
            };
            dcRef.current = channel;
        },
        [setConnectionStatus, setConnectionCode, checkIsReceiveComplete],
    );

    const initializePeerConnection = useCallback(() => {
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
            ],
        });

        pc.oniceconnectionstatechange = () => {
            if (
                pc.iceConnectionState === 'disconnected' ||
                pc.iceConnectionState === 'failed'
            ) {
                if (checkIsReceiveComplete()) return;

                setConnectionStatus('error');
                toast.error('Kết nối gặp sự cố. Vui lòng thử lại.');
            }
        };

        pc.ondatachannel = (event) => {
            setupDataChannel(event.channel);
        };

        pcRef.current = pc;
        return pc;
    }, [setConnectionStatus, setupDataChannel, checkIsReceiveComplete]);

    // TanStack Query for Signaling
    const targetSignalType = mode === 'sender' ? 'answer' : 'offer';
    const { data: remoteSignal } = useQuery({
        queryKey: ['signaling', connectionCode, targetSignalType],
        queryFn: ({ signal }) =>
            pollSignal(connectionCode, targetSignalType, signal),
        enabled: connectionStatus === 'connecting' && !!connectionCode,
        refetchInterval: POLL_INTERVAL,
        staleTime: 0,
        gcTime: 0,
    });

    // Reaction to remote signal
    useEffect(() => {
        if (
            !remoteSignal ||
            connectionStatus !== 'connecting' ||
            !pcRef.current
        )
            return;

        const handleHandshake = async () => {
            try {
                // Prevent repeated processing of the same signal since useQuery polls
                if (pcRef.current?.remoteDescription) return;

                if (
                    mode === 'sender' &&
                    remoteSignal.message.type === 'answer'
                ) {
                    const answer = JSON.parse(remoteSignal.message.data);
                    await pcRef.current?.setRemoteDescription(
                        new RTCSessionDescription(answer),
                    );
                } else if (
                    mode === 'receiver' &&
                    remoteSignal.message.type === 'offer'
                ) {
                    const offer = JSON.parse(remoteSignal.message.data);
                    await pcRef.current?.setRemoteDescription(
                        new RTCSessionDescription(offer),
                    );

                    let signalSent = false;
                    const sendAnswer = () => {
                        if (signalSent || !pcRef.current?.localDescription)
                            return;
                        signalSent = true;
                        sendSignal(connectionCode, {
                            type: 'answer',
                            data: JSON.stringify(
                                pcRef.current.localDescription,
                            ),
                        });
                    };

                    pcRef.current!.onicecandidate = (e) => {
                        if (e.candidate === null) {
                            sendAnswer();
                        }
                    };

                    const answer = await pcRef.current?.createAnswer();
                    if (answer) {
                        await pcRef.current?.setLocalDescription(answer);
                        setTimeout(sendAnswer, 2000);
                    }
                }
            } catch (err) {
                console.error('Handshake error', err);
                toast.error('Lỗi trong quá trình bắt tay. Vui lòng thử lại.');
                setConnectionStatus('error');
            }
        };

        handleHandshake();
    }, [
        remoteSignal,
        connectionStatus,
        mode,
        connectionCode,
        setConnectionStatus,
    ]);

    const startConnection = useCallback(
        async (predefinedCode?: string | unknown) => {
            try {
                cleanup();
                setMode('sender');
                const code =
                    typeof predefinedCode === 'string'
                        ? predefinedCode
                        : generateCode();
                setConnectionCode(code);
                setConnectionStatus('connecting');

                const pc = initializePeerConnection();
                const dc = pc.createDataChannel('sendly-file-transfer');
                setupDataChannel(dc);

                let signalSent = false;
                const sendOffer = () => {
                    if (signalSent || !pc.localDescription) return;
                    signalSent = true;
                    sendSignal(code, {
                        type: 'offer',
                        data: JSON.stringify(pc.localDescription),
                    });
                };

                pc.onicecandidate = (e) => {
                    if (e.candidate === null) {
                        sendOffer();
                    }
                };

                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);

                setTimeout(sendOffer, SEND_OFFER_DELAY);
            } catch (error) {
                console.error('Failed to start connection', error);
                setConnectionStatus('error');
                toast.error('Không thể tạo phiên kết nối mới.');
            }
        },
        [
            cleanup,
            initializePeerConnection,
            setConnectionCode,
            setConnectionStatus,
            setupDataChannel,
            setMode,
        ],
    );

    const joinConnection = useCallback(
        async (incomingCode: string | unknown) => {
            try {
                const code =
                    typeof incomingCode === 'string' ? incomingCode : '';

                const CODE_REGEX = /^[0-9A-Z]{8}$/;
                if (!code || !CODE_REGEX.test(code.toUpperCase())) {
                    toast.error(
                        'Mã code không hợp lệ (phải là 8 ký tự chữ và số).',
                    );
                    return;
                }

                cleanup();
                setMode('receiver');
                setConnectionCode(code);
                setConnectionStatus('connecting');

                initializePeerConnection();
            } catch (error) {
                console.error('Failed to join connection', error);
                setConnectionStatus('error');
                toast.error(
                    'Không thể tham gia kết nối. Vui lòng kiểm tra mã code.',
                );
            }
        },
        [
            cleanup,
            initializePeerConnection,
            setConnectionCode,
            setConnectionStatus,
            setMode,
        ],
    );

    const sendFiles = useCallback(async (files: File[]) => {
        if (!dcRef.current || dcRef.current.readyState !== 'open') return;

        const fileTransfers: FileTransfer[] = files.map((file) => ({
            id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
            fileName: file.name,
            fileSize: file.size,
            progress: 0,
            status: 'pending',
        }));

        setTransferState((prev) => ({
            files: [...(prev?.files || []), ...fileTransfers],
            isReceiving: false,
        }));

        // Send manifest
        dcRef.current.send(
            JSON.stringify({
                type: 'manifest',
                files: fileTransfers.map((f) => ({
                    id: f.id,
                    fileName: f.fileName,
                    fileSize: f.fileSize,
                })),
            }),
        );

        // Process files sequentially
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const transfer = fileTransfers[i];

            if (dcRef.current.readyState !== 'open') break;

            let currentChunkSize = DEFAULT_CHUNK_SIZE;
            if (file.size > 1024 * 1024 * 1024) {
                currentChunkSize = 256 * 1024;
            } else if (file.size > 50 * 1024 * 1024) {
                currentChunkSize = MAX_CHUNK_SIZE;
            } else if (file.size > 1024 * 1024) {
                currentChunkSize = 32 * 1024;
            }

            dcRef.current.send(
                JSON.stringify({
                    type: 'file-start',
                    fileId: transfer.id,
                    fileName: file.name,
                    fileSize: file.size,
                    chunkSize: currentChunkSize,
                }),
            );

            setTransferState((prev) => {
                const currentFiles = prev?.files || [];
                return {
                    isReceiving: false,
                    files: currentFiles.map((f) =>
                        f.id === transfer.id
                            ? { ...f, status: 'transferring' }
                            : f,
                    ),
                };
            });

            await new Promise<void>((resolve, reject) => {
                const reader = new FileReader();
                let offset = 0;

                const readNextChunk = () => {
                    const slice = file.slice(offset, offset + currentChunkSize);
                    reader.readAsArrayBuffer(slice);
                };

                reader.onload = (e) => {
                    if (!dcRef.current || dcRef.current.readyState !== 'open') {
                        reject(new Error('Data channel closed'));
                        return;
                    }

                    if (e.target && e.target.result) {
                        try {
                            const buffer = e.target.result as ArrayBuffer;
                            dcRef.current.send(buffer);
                            offset += buffer.byteLength;

                            const now = Date.now();
                            const progress = Math.min(
                                (offset / file.size) * 100,
                                100,
                            );
                            const isComplete = progress === 100;

                            if (
                                isComplete ||
                                now - lastUpdateRef.current > 100
                            ) {
                                lastUpdateRef.current = now;
                                setTransferState((prev) => {
                                    if (!prev) return prev;
                                    return {
                                        ...prev,
                                        files: prev.files.map((f) =>
                                            f.id === transfer.id
                                                ? {
                                                      ...f,
                                                      progress,
                                                      status: isComplete
                                                          ? 'completed'
                                                          : 'transferring',
                                                  }
                                                : f,
                                        ),
                                    };
                                });
                            }

                            if (offset < file.size) {
                                if (
                                    dcRef.current.bufferedAmount >
                                    dcRef.current.bufferedAmountLowThreshold
                                ) {
                                    resumeRef.current = readNextChunk;
                                } else {
                                    readNextChunk();
                                }
                            } else {
                                toast.success(`Đã gửi: ${file.name}`);
                                resolve();
                            }
                        } catch (error) {
                            reject(error);
                        }
                    }
                };

                reader.onerror = () => reject(new Error('FileReader error'));
                readNextChunk();
            });
        }
    }, []);

    const clearTransfer = useCallback(() => {
        if (transferState?.files) {
            transferState.files.forEach((f) => {
                if (f.objectUrl) URL.revokeObjectURL(f.objectUrl);
            });
        }
        setTransferState(null);
    }, [transferState]);

    const deleteFile = useCallback((fileId: string) => {
        setTransferState((prev) => {
            if (!prev) return null;
            const file = prev.files.find((f) => f.id === fileId);
            if (file?.objectUrl) {
                URL.revokeObjectURL(file.objectUrl);
            }
            const updatedFiles = prev.files.filter((f) => f.id !== fileId);
            if (updatedFiles.length === 0) return null;
            return {
                ...prev,
                files: updatedFiles,
            };
        });
        clearStorage(fileId).catch(console.error);
    }, []);

    useEffect(() => {
        return () => cleanup();
    }, [cleanup]);

    return {
        connectionCode,
        transferState,
        startConnection,
        joinConnection,
        sendFiles,
        clearTransfer,
        deleteFile,
        disconnect: (stayOnCurrentMode = false) => {
            cleanup();
            setConnectionStatus('disconnected');
            if (transferState?.files) {
                transferState.files.forEach((f) => {
                    if (f.objectUrl) URL.revokeObjectURL(f.objectUrl);
                });
            }
            setTransferState(null);
            setConnectionCode('');
            if (!stayOnCurrentMode) setMode(null);
        },
    };
}
