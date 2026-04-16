'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from '@/store/useNotificationStore';
import { generateCode, sendSignal } from '@/lib/signaling';
import { clearStorage, purgeStorage } from '@/lib/fileStorage';
import { useTransferStore } from '@/store/useTransferStore';
import { useAppStore } from '@/store/useAppStore';
import { useFileSender } from './webrtc/useFileSender';
import { useFileReceiver } from './webrtc/useFileReceiver';
import { useWebRTCConnection } from './webrtc/useWebRTCConnection';
import { SEND_OFFER_DELAY, HOST_CODE_EXPIRATION, GUEST_CODE_EXPIRATION } from './webrtc/constants';

import { audioService } from '@/utils/audio';
import { useNetwork } from '@/hooks/useNetwork';

export function useWebRTC() {
    const { t } = useTranslation('common');
    const isOnline = useNetwork();
    const [dc, setDc] = useState<RTCDataChannel | null>(null);

    const {
        mode,
        connectionStatus,
        setConnectionStatus,
        connectionCode,
        setConnectionCode,
        setMode,
        isCodeExpired,
        setCodeExpired,
        connectionCodeCreatedAt,
    } = useAppStore();

    // Sound effects for connection status
    useEffect(() => {
        if (connectionStatus === 'connected') {
            audioService.playSuccess();
        } else if (connectionStatus === 'error') {
            audioService.playError();
        }
    }, [connectionStatus]);

    // Expiration Timer Logic
    useEffect(() => {
        if (
            connectionStatus !== 'connecting' ||
            !connectionCode ||
            isCodeExpired ||
            !connectionCodeCreatedAt
        ) {
            return;
        }

        const checkExpiration = () => {
            const now = Date.now();
            const elapsed = now - connectionCodeCreatedAt;
            const expirationTime =
                mode === 'host' ? HOST_CODE_EXPIRATION : GUEST_CODE_EXPIRATION;
            const remaining = expirationTime - elapsed;

            if (remaining <= 0) {
                setCodeExpired(true);
            }
        };

        const timer = setInterval(checkExpiration, 1000);
        checkExpiration(); // Initial check

        return () => clearInterval(timer);
    }, [connectionStatus, connectionCode, isCodeExpired, connectionCodeCreatedAt, setCodeExpired, mode]);

    const { handleMessage, isTransferFinished, hasSuccessfulFiles } =
        useFileReceiver();
    const { sendFiles, resumeSending } = useFileSender(dc);

    const { clearTransfers, deleteFile, cancelTransfer, transferState } =
        useTransferStore();

    const setupDataChannel = useCallback(
        (channel: RTCDataChannel) => {
            channel.onopen = () => {
                setConnectionStatus('connected');
                toast.success(t('toast.connected'));
            };

            channel.onclose = () => {
                setConnectionStatus('disconnected');
                if (hasSuccessfulFiles()) {
                    toast.info(t('toast.partner_disconnected'));
                } else {
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
            hasSuccessfulFiles,
            clearTransfers,
            setConnectionCode,
            setMode,
            resumeSending,
        ],
    );

    const { cleanup, initializePeerConnection, dcRef, isSignalFound } =
        useWebRTCConnection(setupDataChannel, isTransferFinished);

    // Overwrite setDc when dcRef changes (internal to useWebRTCConnection)
    useEffect(() => {
        if (dcRef.current) setDc(dcRef.current);
    }, [dcRef]);

    const startConnection = useCallback(
        async (predefinedCode?: string | unknown) => {
            try {
                cleanup();
                await purgeStorage().catch(console.error);
                clearTransfers();
                setMode('host');
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
                    // Stop sending offer if code is expired
                    if (useAppStore.getState().isCodeExpired) return;

                    if (signalSent || !pc.localDescription) return;
                    signalSent = true;
                    sendSignal(code, {
                        type: 'offer',
                        data: JSON.stringify(pc.localDescription),
                    }).catch((err) => {
                        console.error('Failed to send offer', err);
                        setConnectionStatus('error', 'signaling_failed');
                    });
                };

                pc.onicecandidate = (e) => {
                    if (e.candidate) {
                        console.log(
                            'New ICE Candidate:',
                            e.candidate.candidate,
                        );
                    } else {
                        console.log('ICE Gathering Finished');
                        sendOffer();
                    }
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
            clearTransfers,
            setMode,
            setConnectionCode,
            setConnectionStatus,
            initializePeerConnection,
            setupDataChannel,
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
                await purgeStorage().catch(console.error);
                clearTransfers();
                setMode('guest');
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
            clearTransfers,
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
        async (stayOnCurrentMode = false) => {
            const activeFiles =
                transferState?.files.filter(
                    (f) =>
                        f.status === 'transferring' || f.status === 'pending',
                ) || [];

            if (activeFiles.length > 0 && dc && dc.readyState === 'open') {
                activeFiles.forEach((file) => {
                    try {
                        dc.send(
                            JSON.stringify({
                                type: 'file-cancel',
                                fileId: file.id,
                            }),
                        );
                        cancelTransfer(file.id);
                    } catch (e) {
                        console.error('Failed to send cancel message', e);
                    }
                });

                // Small delay to ensure messages are dispatched before closing
                await new Promise((resolve) => setTimeout(resolve, 200));
            }

            cleanup();
            purgeStorage().catch(console.error);
            setConnectionStatus('disconnected');
            clearTransfers();
            setConnectionCode('');
            setDc(null);

            // By default, go back to the connection step (Sender/Receiver tab)
            // If stayOnCurrentMode is false, it goes back to mode selection
            if (!stayOnCurrentMode) setMode(null);
        },
        [
            cleanup,
            setConnectionStatus,
            clearTransfers,
            setConnectionCode,
            setMode,
            transferState,
            dc,
            cancelTransfer,
        ],
    );

    // Initial cleanup on app load
    useEffect(() => {
        purgeStorage().catch(console.error);
        clearTransfers();
    }, [clearTransfers]);

    useEffect(() => {
        if (!isOnline) {
            const currentStatus = useAppStore.getState().connectionStatus;
            if (
                currentStatus === 'connected' ||
                currentStatus === 'connecting'
            ) {
                setConnectionStatus('error', 'offline');
                toast.error(t('error.offline'));
            }
        }
    }, [isOnline, setConnectionStatus, t]);

    useEffect(() => {
        return () => {
            cleanup();
            purgeStorage().catch(console.error);
            clearTransfers();
        };
    }, [cleanup, clearTransfers]);

    const handleCancelTransfer = useCallback(
        (fileId: string) => {
            const file = transferState?.files.find((f) => f.id === fileId);
            cancelTransfer(fileId);
            if (dc && dc.readyState === 'open') {
                dc.send(
                    JSON.stringify({
                        type: 'file-cancel',
                        fileId,
                    }),
                );
            }
            toast.error(
                t('toast.cancelled', { name: file?.fileName || fileId }),
            );
        },
        [dc, cancelTransfer, transferState, t],
    );

    const handleClearTransfer = useCallback(() => {
        purgeStorage().catch(console.error);
        clearTransfers();
    }, [clearTransfers]);

    return {
        connectionCode,
        transferState,
        startConnection,
        joinConnection,
        sendFiles,
        clearTransfer: handleClearTransfer,
        deleteFile: handleDeleteFile,
        cancelTransfer: handleCancelTransfer,
        isSignalFound,
        disconnect,
    };
}
