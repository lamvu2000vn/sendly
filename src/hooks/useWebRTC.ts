import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { generateCode, sendSignal } from '@/lib/signaling';
import { clearStorage } from '@/lib/fileStorage';
import { useTransferStore } from '@/store/useTransferStore';
import { useAppStore } from '@/store/useAppStore';
import { useFileSender } from './webrtc/useFileSender';
import { useFileReceiver } from './webrtc/useFileReceiver';
import { useWebRTCConnection } from './webrtc/useWebRTCConnection';
import { SEND_OFFER_DELAY } from './webrtc/constants';

export function useWebRTC() {
    const { t } = useTranslation('common');
    const [dc, setDc] = useState<RTCDataChannel | null>(null);

    const { setConnectionStatus, connectionCode, setConnectionCode, setMode } =
        useAppStore();

    const { handleMessage, isReceiveComplete } = useFileReceiver();
    const { sendFiles, resumeSending } = useFileSender(dc);

    const { clearTransfers, deleteFile, transferState } = useTransferStore();

    const setupDataChannel = useCallback(
        (channel: RTCDataChannel) => {
            channel.onopen = () => {
                setConnectionStatus('connected');
                toast.success(t('toast.connected'));
            };

            channel.onclose = () => {
                if (isReceiveComplete()) {
                    toast.info(t('toast.sender_disconnected'));
                } else {
                    setConnectionStatus('disconnected');
                    clearTransfers();
                    setConnectionCode('');
                    setMode(null);
                    toast.info(t('toast.disconnected'));
                }
            };

            channel.binaryType = 'arraybuffer';
            channel.bufferedAmountLowThreshold = 1024 * 1024; // 1 MB

            channel.onbufferedamountlow = () => {
                resumeSending();
            };

            channel.onmessage = handleMessage;
            setDc(channel);
        },
        [
            handleMessage,
            setConnectionStatus,
            t,
            isReceiveComplete,
            clearTransfers,
            setConnectionCode,
            setMode,
            resumeSending,
        ],
    );

    const { cleanup, initializePeerConnection, dcRef } = useWebRTCConnection(
        setupDataChannel,
        isReceiveComplete,
    );

    // Overwrite setDc when dcRef changes (internal to useWebRTCConnection)
    useEffect(() => {
        if (dcRef.current) setDc(dcRef.current);
    }, [dcRef]);

    const startConnection = useCallback(
        async (predefinedCode?: string | unknown) => {
            try {
                cleanup();
                setMode('sender');
                setDc(null);

                const code =
                    typeof predefinedCode === 'string'
                        ? predefinedCode
                        : generateCode();
                setConnectionCode(code);
                setConnectionStatus('connecting');

                const pc = initializePeerConnection();
                const channel = pc.createDataChannel('sendly-file-transfer');
                setupDataChannel(channel);

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
                    if (e.candidate === null) sendOffer();
                };

                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                setTimeout(sendOffer, SEND_OFFER_DELAY);
            } catch (error) {
                console.error('Failed to start connection', error);
                setConnectionStatus('error');
                toast.error(t('toast.create_session_error'));
            }
        },
        [
            cleanup,
            initializePeerConnection,
            setConnectionCode,
            setConnectionStatus,
            setupDataChannel,
            setMode,
            t,
        ],
    );

    const joinConnection = useCallback(
        async (incomingCode: string | unknown) => {
            try {
                const code =
                    typeof incomingCode === 'string'
                        ? incomingCode.trim().toUpperCase()
                        : '';
                const CODE_REGEX = /^[0-9A-Z]{8}$/;

                if (!CODE_REGEX.test(code)) {
                    toast.error(t('toast.invalid_code'));
                    return;
                }

                cleanup();
                setMode('receiver');
                setDc(null);
                setConnectionCode(code);
                setConnectionStatus('connecting');
                initializePeerConnection();
            } catch (error) {
                console.error('Failed to join connection', error);
                setConnectionStatus('error');
                toast.error(t('toast.join_error'));
            }
        },
        [
            cleanup,
            initializePeerConnection,
            setConnectionCode,
            setConnectionStatus,
            setMode,
            t,
        ],
    );

    const handleDeleteFile = useCallback(
        (fileId: string) => {
            deleteFile(fileId);
            clearStorage(fileId).catch(console.error);
        },
        [deleteFile],
    );

    const disconnect = useCallback(
        (stayOnCurrentMode = false) => {
            cleanup();
            clearStorage().catch(console.error);
            setConnectionStatus('disconnected');
            clearTransfers();
            setConnectionCode('');
            setDc(null);
            if (!stayOnCurrentMode) setMode(null);
        },
        [
            cleanup,
            setConnectionStatus,
            clearTransfers,
            setConnectionCode,
            setMode,
        ],
    );

    useEffect(() => {
        return () => {
            cleanup();
            clearStorage().catch(console.error);
        };
    }, [cleanup]);

    return {
        connectionCode,
        transferState,
        startConnection,
        joinConnection,
        sendFiles,
        clearTransfer: clearTransfers,
        deleteFile: handleDeleteFile,
        disconnect,
    };
}
