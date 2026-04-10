import { useCallback, useRef, useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { generateCode, sendSignal, pollSignal } from '@/lib/signaling';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { saveChunk, clearStorage, getBlobFromStorage } from '@/lib/fileStorage';

const CHUNK_SIZE = 16 * 1024; // 16 KB
const SEND_OFFER_DELAY = 3000;
const POLL_INTERVAL = 2000;

export interface TransferState {
    fileName: string;
    fileSize: number;
    progress: number;
    isReceiving: boolean;
    objectUrl?: string;
}

export function useWebRTC() {
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const dcRef = useRef<RTCDataChannel | null>(null);
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

    const receivedSize = useRef<number>(0);
    const expectedSize = useRef<number>(0);
    const fileNameRef = useRef<string>('');
    const lastUpdateRef = useRef<number>(0);

    const cleanup = useCallback(() => {
        pcRef.current?.close();
        pcRef.current = null;
        dcRef.current = null;
        clearStorage().catch(console.error);
    }, []);

    const setupDataChannel = useCallback(
        (channel: RTCDataChannel) => {
            channel.onopen = () => {
                setConnectionStatus('connected');
                toast.success('Đã kết nối thành công!');
            };
            channel.onclose = () => {
                const currentMode = useAppStore.getState().mode;
                const isReceiveComplete =
                    currentMode === 'receiver' &&
                    expectedSize.current > 0 &&
                    receivedSize.current === expectedSize.current;

                if (isReceiveComplete) {
                    toast.info(
                        'Người gửi đã ngắt kết nối. Bạn vẫn có thể truy cập file đã nhận.',
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
            channel.onmessage = async (event) => {
                try {
                    if (typeof event.data === 'string') {
                        const msg = JSON.parse(event.data);
                        if (msg.type === 'file-start') {
                            fileNameRef.current = msg.fileName;
                            expectedSize.current = msg.fileSize;
                            receivedSize.current = 0;
                            await clearStorage();
                            setTransferState({
                                fileName: msg.fileName,
                                fileSize: msg.fileSize,
                                progress: 0,
                                isReceiving: true,
                            });
                        }
                    } else if (event.data instanceof ArrayBuffer) {
                        await saveChunk(event.data);
                        receivedSize.current += event.data.byteLength;

                        const now = Date.now();
                        const isComplete =
                            receivedSize.current === expectedSize.current;

                        if (isComplete || now - lastUpdateRef.current > 100) {
                            lastUpdateRef.current = now;
                            setTransferState((prev) => {
                                if (!prev) return prev;
                                return {
                                    ...prev,
                                    progress:
                                        (receivedSize.current /
                                            expectedSize.current) *
                                        100,
                                };
                            });
                        }

                        if (receivedSize.current === expectedSize.current) {
                            const blob = await getBlobFromStorage();
                            const url = URL.createObjectURL(blob);
                            setTransferState((prev) => {
                                if (!prev) return prev;
                                return {
                                    ...prev,
                                    progress: 100,
                                    objectUrl: url,
                                };
                            });
                            toast.success(`Đã nhận: ${fileNameRef.current}`);
                        }
                    }
                } catch (error) {
                    console.error('Data channel message error', error);
                    toast.error('Lỗi khi nhận dữ liệu. Vui lòng thử lại.');
                }
            };
            dcRef.current = channel;
        },
        [setConnectionStatus, setConnectionCode],
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
                setConnectionStatus('error');
                toast.error('Kết nối gặp sự cố. Vui lòng thử lại.');
            }
        };

        pc.ondatachannel = (event) => {
            setupDataChannel(event.channel);
        };

        pcRef.current = pc;
        return pc;
    }, [setConnectionStatus, setupDataChannel]);

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
                // If predefinedCode is not a string (e.g. it's a MouseEvent from a button click),
                // generate a new random code instead.
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

                // Fallback timeout in case ICE gathering takes too long
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
                // Ensure we have a string code
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

    const sendFile = useCallback((file: File) => {
        if (!dcRef.current || dcRef.current.readyState !== 'open') return;

        setTransferState({
            fileName: file.name,
            fileSize: file.size,
            progress: 0,
            isReceiving: false,
        });

        dcRef.current.send(
            JSON.stringify({
                type: 'file-start',
                fileName: file.name,
                fileSize: file.size,
            }),
        );

        const reader = new FileReader();
        let offset = 0;

        const readNextChunk = () => {
            const slice = file.slice(offset, offset + CHUNK_SIZE);
            reader.readAsArrayBuffer(slice);
        };

        reader.onload = (e) => {
            if (!dcRef.current || dcRef.current.readyState !== 'open') return;
            if (e.target && e.target.result) {
                try {
                    dcRef.current.send(e.target.result as ArrayBuffer);
                    offset += CHUNK_SIZE;

                    const now = Date.now();
                    const progress = Math.min((offset / file.size) * 100, 100);
                    const isComplete = progress === 100;

                    if (isComplete || now - lastUpdateRef.current > 100) {
                        lastUpdateRef.current = now;
                        setTransferState((prev) =>
                            prev
                                ? {
                                      ...prev,
                                      progress,
                                  }
                                : prev,
                        );
                    }

                    if (offset < file.size) {
                        if (dcRef.current.bufferedAmount > 1024 * 1024 * 5) {
                            setTimeout(readNextChunk, 50);
                        } else {
                            readNextChunk();
                        }
                    } else {
                        setTransferState((prev) =>
                            prev ? { ...prev, progress: 100 } : prev,
                        );
                        toast.success(`Đã gửi: ${file.name}`);
                    }
                } catch (error) {
                    console.error('Error sending file', error);
                    toast.error(
                        'Lỗi khi gửi file. Vui lòng kiểm tra lại kết nối.',
                    );
                }
            }
        };

        readNextChunk();
    }, []);

    const clearTransfer = useCallback(() => {
        if (transferState?.objectUrl) {
            URL.revokeObjectURL(transferState.objectUrl);
        }
        setTransferState(null);
    }, [transferState]);

    useEffect(() => {
        return () => cleanup();
    }, [cleanup]);

    return {
        connectionCode,
        transferState,
        startConnection,
        joinConnection,
        sendFile,
        clearTransfer,
        disconnect: (stayOnCurrentMode = false) => {
            cleanup();
            setConnectionStatus('disconnected');
            if (transferState?.objectUrl) {
                URL.revokeObjectURL(transferState.objectUrl);
            }
            setTransferState(null);
            setConnectionCode('');
            if (!stayOnCurrentMode) setMode(null);
        },
    };
}
