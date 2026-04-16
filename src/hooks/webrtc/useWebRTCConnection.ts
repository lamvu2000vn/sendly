import { useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useNotificationStore';
import { useQuery } from '@tanstack/react-query';
import { useNetwork } from '@/hooks/useNetwork';
import { pollSignal, sendSignal } from '@/lib/signaling';
import {
    ICE_SERVERS,
    POLL_INTERVAL,
    GUEST_SIGNAL_TIMEOUT,
    GUEST_ICE_TIMEOUT,
} from './constants';

export function useWebRTCConnection(
    onDataChannel: (channel: RTCDataChannel) => void,
    isTransferFinished: () => boolean,
) {
    const { t } = useTranslation('common');
    const isOnline = useNetwork();
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const dcRef = useRef<RTCDataChannel | null>(null);
    const iceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const signalingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const {
        connectionStatus,
        setConnectionStatus,
        connectionCode,
        mode,
        isCodeExpired,
    } = useAppStore();

    const cleanup = useCallback(() => {
        if (iceTimeoutRef.current) {
            clearTimeout(iceTimeoutRef.current);
            iceTimeoutRef.current = null;
        }
        if (signalingTimeoutRef.current) {
            clearTimeout(signalingTimeoutRef.current);
            signalingTimeoutRef.current = null;
        }
        pcRef.current?.close();
        pcRef.current = null;
        dcRef.current = null;
    }, []);

    const initializePeerConnection = useCallback(() => {
        const pc = new RTCPeerConnection({
            iceServers: ICE_SERVERS,
        });

        pc.oniceconnectionstatechange = () => {
            const state = pc.iceConnectionState;
            console.log('ICE Connection State:', state);

            if (state === 'connected' || state === 'completed') {
                if (iceTimeoutRef.current) {
                    clearTimeout(iceTimeoutRef.current);
                    iceTimeoutRef.current = null;
                }
            }

            if (state === 'checking') {
                // Start timeout if not already started
                if (!iceTimeoutRef.current) {
                    const timeoutMs =
                        mode === 'guest' ? GUEST_ICE_TIMEOUT : 30000;
                    iceTimeoutRef.current = setTimeout(() => {
                        console.warn('ICE Connection Timeout');
                        const currentStatus =
                            useAppStore.getState().connectionStatus;
                        if (
                            currentStatus === 'connecting' &&
                            pc.iceConnectionState !== 'connected'
                        ) {
                            setConnectionStatus('error', 'network_restricted');
                            toast.error(t('toast.connection_issue'));
                        }
                    }, timeoutMs);
                }
            }

            if (state === 'failed') {
                if (iceTimeoutRef.current) {
                    clearTimeout(iceTimeoutRef.current);
                    iceTimeoutRef.current = null;
                }

                if (isTransferFinished()) return;

                const currentStatus = useAppStore.getState().connectionStatus;
                if (currentStatus === 'disconnected') return;

                setConnectionStatus(
                    'error',
                    !isOnline ? 'offline' : 'network_failed',
                );
                toast.error(t('toast.connection_issue'));
            }
        };

        pc.ondatachannel = (event) => {
            onDataChannel(event.channel);
            dcRef.current = event.channel;
        };

        pcRef.current = pc;
        return pc;
    }, [mode, setConnectionStatus, t, isTransferFinished, isOnline, onDataChannel]);

    // TanStack Query for Signaling
    const targetSignalType = mode === 'host' ? 'answer' : 'offer';
    const { data: remoteSignal } = useQuery({
        queryKey: ['signaling', connectionCode, targetSignalType],
        queryFn: ({ signal }) =>
            pollSignal(connectionCode, targetSignalType, signal),
        enabled:
            connectionStatus === 'connecting' &&
            !!connectionCode &&
            !isCodeExpired,
        refetchInterval: POLL_INTERVAL,
        staleTime: 0,
        gcTime: 0,
    });

    // Reaction to remote signal (Handshake) & Signaling Timeout
    useEffect(() => {
        if (connectionStatus !== 'connecting') {
            if (signalingTimeoutRef.current) {
                clearTimeout(signalingTimeoutRef.current);
                signalingTimeoutRef.current = null;
            }
            return;
        }

        // Start signaling timeout if not already started and no signal yet
        // Guest only: if we don't find a signal within 15s, the code is likely invalid
        if (mode === 'guest' && !remoteSignal && !signalingTimeoutRef.current) {
            signalingTimeoutRef.current = setTimeout(() => {
                console.warn('Signaling Timeout - Code might be invalid');
                setConnectionStatus('error', 'invalid_code');
            }, GUEST_SIGNAL_TIMEOUT);
        }

        if (!remoteSignal || !pcRef.current || pcRef.current.remoteDescription)
            return;

        // Clear timeout as soon as we get signal
        if (signalingTimeoutRef.current) {
            clearTimeout(signalingTimeoutRef.current);
            signalingTimeoutRef.current = null;
        }

        const handleHandshake = async () => {
            try {
                if (mode === 'host' && remoteSignal.message.type === 'answer') {
                    const answer = JSON.parse(remoteSignal.message.data);
                    await pcRef.current?.setRemoteDescription(
                        new RTCSessionDescription(answer),
                    );
                } else if (
                    mode === 'guest' &&
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
                        }).catch((err) => {
                            console.error('Failed to send answer', err);
                            setConnectionStatus('error', 'signaling_failed');
                        });
                    };

                    pcRef.current!.onicecandidate = (e) => {
                        if (e.candidate) {
                            console.log(
                                'New ICE Candidate:',
                                e.candidate.candidate,
                            );
                        } else {
                            console.log('ICE Gathering Finished');
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
                toast.error(t('toast.handshake_error'));
                setConnectionStatus('error', 'handshake_failed');
            }
        };

        handleHandshake();
    }, [
        remoteSignal,
        connectionStatus,
        mode,
        connectionCode,
        setConnectionStatus,
        t,
    ]);

    return {
        pcRef,
        dcRef,
        cleanup,
        initializePeerConnection,
        isSignalFound: !!remoteSignal,
    };
}
