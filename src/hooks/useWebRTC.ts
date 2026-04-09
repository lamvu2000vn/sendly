import { useCallback, useRef, useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { generateCode, sendSignal, pollSignal } from '@/lib/signaling';
import { toast } from 'sonner';

const CHUNK_SIZE = 16 * 1024; // 16 KB

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
    const { setConnectionStatus, connectionCode, setConnectionCode } =
        useAppStore();
    const [localToken, setLocalToken] = useState<string>('');
    const [transferState, setTransferState] = useState<TransferState | null>(
        null,
    );

    const receiveBuffer = useRef<ArrayBuffer[]>([]);
    const receivedSize = useRef<number>(0);
    const expectedSize = useRef<number>(0);
    const fileNameRef = useRef<string>('');
    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    const cleanup = useCallback(() => {
        if (pollingRef.current) clearInterval(pollingRef.current);
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
    const startConnection = useCallback(async () => {
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

            // Poll for Answer in a controlled loop
            const pollForAnswer = async () => {
                let attempts = 0;
                while (attempts < 20) {
                    // Total ~10 minutes
                    if (!pcRef.current) break;
                    attempts++;
                    try {
                        const signal = await pollSignal(code, 'answer');
                        if (signal && signal.type === 'answer') {
                            const answer = JSON.parse(signal.data);
                            await pc.setRemoteDescription(
                                new RTCSessionDescription(answer),
                            );
                            return; // Success
                        }
                    } catch (err) {
                        console.error('Poll answer error', err);
                    }
                    // Wait a bit before next poll if it was a quick failure/null
                    await new Promise((resolve) => setTimeout(resolve, 2000));
                }
                setConnectionStatus('error');
                toast.error('Connection timeout. Please try again.');
            };

            pollForAnswer();
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
    ]);

    // Automated signaling logic for Receiver
    const joinConnection = useCallback(
        async (code: string) => {
            try {
                cleanup();
                setConnectionCode(code);
                setConnectionStatus('connecting');

                // Wait for Offer in a loop
                let offerSignal: any = null;
                let attempts = 0;
                while (attempts < 5) {
                    attempts++;
                    offerSignal = await pollSignal(code, 'offer');
                    if (offerSignal && offerSignal.type === 'offer') break;
                    // If offer not found yet, maybe sender is still gathering ICE.
                }

                if (!offerSignal || offerSignal.type !== 'offer') {
                    setConnectionStatus('error');
                    toast.error('Could not find a sender with this code.');
                    return;
                }

                const offer = JSON.parse(offerSignal.data);
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
        localToken,
        connectionCode,
        transferState,
        startConnection,
        joinConnection,
        sendFile,
        disconnect: () => {
            cleanup();
            setConnectionStatus('disconnected');
            setTransferState(null);
            setConnectionCode('');
        },
    };
}
