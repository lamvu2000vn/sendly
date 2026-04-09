import { useCallback, useRef, useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { generateCode, sendSignal, pollSignal } from '@/lib/signaling';
import { toast } from 'sonner';

const CHUNK_SIZE = 16 * 1024; // 16 KB
const CODE_EXPIRY_SECONDS = 10; // 5 minutes

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
    const abortControllerRef = useRef<AbortController | null>(null);
    const [transferState, setTransferState] = useState<TransferState | null>(
        null,
    );
    const [expiryCountdown, setExpiryCountdown] =
        useState<number>(CODE_EXPIRY_SECONDS);

    const receiveBuffer = useRef<ArrayBuffer[]>([]);
    const receivedSize = useRef<number>(0);
    const expectedSize = useRef<number>(0);
    const fileNameRef = useRef<string>('');
    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    const cleanup = useCallback(() => {
        if (pollingRef.current) clearInterval(pollingRef.current);
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        pcRef.current?.close();
        pcRef.current = null;
        dcRef.current = null;
    }, []);

    const setupDataChannel = useCallback(
        (channel: RTCDataChannel) => {
            channel.onopen = () => {
                setConnectionStatus('connected');
                toast.success('Devices connected successfully!');
                if (pollingRef.current) clearInterval(pollingRef.current);
            };
            channel.onclose = () => {
                setConnectionStatus('disconnected');
                setTransferState(null);
            };
            channel.binaryType = 'arraybuffer';
            channel.onmessage = (event) => {
                if (typeof event.data === 'string') {
                    const msg = JSON.parse(event.data);
                    if (msg.type === 'file-start') {
                        fileNameRef.current = msg.fileName;
                        expectedSize.current = msg.fileSize;
                        receiveBuffer.current = [];
                        receivedSize.current = 0;
                        setTransferState({
                            fileName: msg.fileName,
                            fileSize: msg.fileSize,
                            progress: 0,
                            isReceiving: true,
                        });
                    }
                } else if (event.data instanceof ArrayBuffer) {
                    receiveBuffer.current.push(event.data);
                    receivedSize.current += event.data.byteLength;
                    setTransferState((prev) => {
                        if (!prev) return prev;
                        return {
                            ...prev,
                            progress:
                                (receivedSize.current / expectedSize.current) *
                                100,
                        };
                    });

                    if (receivedSize.current === expectedSize.current) {
                        const blob = new Blob(receiveBuffer.current);
                        const url = URL.createObjectURL(blob);
                        setTransferState((prev) => {
                            if (!prev) return prev;
                            return { ...prev, progress: 100, objectUrl: url };
                        });
                        toast.success(`Received ${fileNameRef.current}`);
                    }
                }
            };
            dcRef.current = channel;
        },
        [setConnectionStatus],
    );

    const initializePeerConnection = useCallback(() => {
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });

        pc.oniceconnectionstatechange = () => {
            if (
                pc.iceConnectionState === 'disconnected' ||
                pc.iceConnectionState === 'failed'
            ) {
                setConnectionStatus('error');
            }
        };

        pc.ondatachannel = (event) => {
            setupDataChannel(event.channel);
        };

        pcRef.current = pc;
        return pc;
    }, [setConnectionStatus, setupDataChannel]);

    // Automated signaling logic for Sender
    const performStartConnection = useCallback(async () => {
        try {
            cleanup();
            const code = generateCode();
            setConnectionCode(code);
            setConnectionStatus('connecting');

            const pc = initializePeerConnection();
            const dc = pc.createDataChannel('sendly-file-transfer');
            setupDataChannel(dc);

            pc.onicecandidate = (e) => {
                if (e.candidate === null && pc.localDescription) {
                    sendSignal(code, {
                        type: 'offer',
                        data: JSON.stringify(pc.localDescription),
                    });
                }
            };

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            const controller = new AbortController();
            abortControllerRef.current = controller;

            const pollForAnswer = async (signal: AbortSignal) => {
                const startTime = Date.now();
                while (Date.now() - startTime < CODE_EXPIRY_SECONDS * 1000) {
                    if (signal.aborted || !pcRef.current) break;
                    try {
                        const signalData = await pollSignal(
                            code,
                            'answer',
                            signal,
                        );
                        if (
                            signalData &&
                            signalData.message.type === 'answer'
                        ) {
                            const answer = JSON.parse(signalData.message.data);
                            await pc.setRemoteDescription(
                                new RTCSessionDescription(answer),
                            );
                            return; // Success
                        }
                    } catch (err) {
                        if ((err as any).name === 'AbortError') break;
                        console.error('Poll answer error', err);
                    }
                    await new Promise((resolve) => setTimeout(resolve, 2000));
                }
                if (
                    !signal.aborted &&
                    pcRef.current &&
                    connectionStatus !== 'connected'
                ) {
                    // Logic for automatic refresh is handled by the useEffect
                    console.log('Connection polling timed out');
                }
            };

            pollForAnswer(controller.signal);
        } catch (error) {
            console.error('Failed to start connection', error);
            setConnectionStatus('error');
        }
    }, [
        cleanup,
        initializePeerConnection,
        setConnectionCode,
        setConnectionStatus,
        setupDataChannel,
        connectionStatus,
    ]);

    const startConnection = useCallback(async () => {
        setMode('sender');
        setExpiryCountdown(CODE_EXPIRY_SECONDS);
        await performStartConnection();
    }, [performStartConnection, setMode]);

    // Automated signaling logic for Receiver
    const joinConnection = useCallback(
        async (code: string) => {
            try {
                setMode('receiver');
                cleanup();
                setConnectionCode(code);
                setConnectionStatus('connecting');

                // 1. Validate code format
                const CODE_REGEX = /^[0-9A-Z]{8}$/;
                if (!CODE_REGEX.test(code.toUpperCase())) {
                    setConnectionStatus('error');
                    toast.error(
                        'Mã code không hợp lệ (phải là 8 ký tự chữ và số).',
                    );
                    return;
                }

                const controller = new AbortController();
                abortControllerRef.current = controller;
                const signal = controller.signal;

                // Wait for Offer in a loop
                let offerData: any = null;
                let attempts = 0;
                while (attempts < 10) {
                    if (signal.aborted) break;
                    attempts++;
                    const result = await pollSignal(code, 'offer', signal);
                    if (result && result.message.type === 'offer') {
                        // 2. Check for expiration (e.g., 5 minutes = 300 seconds)
                        const now = Math.floor(Date.now() / 1000);
                        if (now - result.timestamp > CODE_EXPIRY_SECONDS) {
                            setConnectionStatus('error');
                            toast.error(
                                'Mã code đã hết hạn. Vui lòng yêu cầu mã mới.',
                            );
                            return;
                        }
                        offerData = result.message;
                        break;
                    }
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                }

                if (signal.aborted) return;

                if (!offerData || offerData.type !== 'offer') {
                    setConnectionStatus('error');
                    toast.error(
                        'Không tìm thấy người gửi với mã code này hoặc mã đã hết hạn.',
                    );
                    return;
                }

                const offer = JSON.parse(offerData.data);
                const pc = initializePeerConnection();
                await pc.setRemoteDescription(new RTCSessionDescription(offer));

                pc.onicecandidate = (e) => {
                    if (e.candidate === null && pc.localDescription) {
                        sendSignal(code, {
                            type: 'answer',
                            data: JSON.stringify(pc.localDescription),
                        });
                    }
                };

                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
            } catch (error) {
                console.error('Failed to join connection', error);
                setConnectionStatus('error');
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
                    setTransferState((prev) =>
                        prev
                            ? {
                                  ...prev,
                                  progress: Math.min(
                                      (offset / file.size) * 100,
                                      100,
                                  ),
                              }
                            : prev,
                    );

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
                        toast.success(`Sent ${file.name}`);
                    }
                } catch (error) {
                    console.error('Error sending file', error);
                    toast.error('Error sending file. Check connection.');
                }
            }
        };

        readNextChunk();
    }, []);

    useEffect(() => {
        return () => cleanup();
    }, [cleanup]);

    return {
        connectionCode,
        transferState,
        expiryCountdown,
        startConnection,
        joinConnection,
        sendFile,
        disconnect: (stayOnCurrentMode = false) => {
            cleanup();
            setConnectionStatus('disconnected');
            setTransferState(null);
            setConnectionCode('');
            setExpiryCountdown(0);
            if (!stayOnCurrentMode) setMode('sender');
        },
    };
}
