import { useCallback, useRef, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';

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
    const { setConnectionStatus } = useAppStore();
    const [localToken, setLocalToken] = useState<string>('');
    const [transferState, setTransferState] = useState<TransferState | null>(
        null,
    );

    const receiveBuffer = useRef<ArrayBuffer[]>([]);
    const receivedSize = useRef<number>(0);
    const expectedSize = useRef<number>(0);
    const fileNameRef = useRef<string>('');

    const setupDataChannel = useCallback(
        (channel: RTCDataChannel) => {
            channel.onopen = () => {
                setConnectionStatus('connected');
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

    const createOffer = useCallback(async () => {
        setConnectionStatus('connecting');
        const pc = initializePeerConnection();
        const dc = pc.createDataChannel('sendly-file-transfer');
        setupDataChannel(dc);

        pc.onicecandidate = (e) => {
            if (e.candidate === null) {
                // Gathering complete
                const offer = JSON.stringify(pc.localDescription);
                setLocalToken(btoa(offer));
            }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
    }, [initializePeerConnection, setConnectionStatus, setupDataChannel]);

    const handleOfferOrAnswer = useCallback(
        async (token: string, mode: 'sender' | 'receiver') => {
            try {
                const decoded = JSON.parse(atob(token));
                if (mode === 'receiver') {
                    setConnectionStatus('connecting');
                    const pc = initializePeerConnection();
                    await pc.setRemoteDescription(
                        new RTCSessionDescription(decoded),
                    );

                    pc.onicecandidate = (e) => {
                        if (e.candidate === null) {
                            const answer = JSON.stringify(pc.localDescription);
                            setLocalToken(btoa(answer));
                        }
                    };

                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                } else if (mode === 'sender') {
                    if (!pcRef.current) return;
                    await pcRef.current.setRemoteDescription(
                        new RTCSessionDescription(decoded),
                    );
                }
            } catch (error) {
                console.error('Invalid token', error);
                alert('Invalid connection token!');
            }
        },
        [initializePeerConnection, setConnectionStatus],
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
                        // To avoid freezing the UI and flooding the buffer, wait a bit if buffer is full
                        if (dcRef.current.bufferedAmount > 1024 * 1024 * 5) {
                            setTimeout(readNextChunk, 50);
                        } else {
                            readNextChunk();
                        }
                    } else {
                        setTransferState((prev) =>
                            prev ? { ...prev, progress: 100 } : prev,
                        );
                    }
                } catch (error) {
                    console.error('Error sending file', error);
                    alert(
                        'Error sending file. File might be too large or connection unstable.',
                    );
                }
            }
        };

        readNextChunk();
    }, []);

    return {
        localToken,
        transferState,
        createOffer,
        handleOfferOrAnswer,
        sendFile,
        disconnect: () => {
            pcRef.current?.close();
            pcRef.current = null;
            setConnectionStatus('disconnected');
            setTransferState(null);
            setLocalToken('');
        },
    };
}
