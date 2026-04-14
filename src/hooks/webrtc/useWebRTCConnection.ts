import { useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useNotificationStore';
import { useQuery } from '@tanstack/react-query';
import { pollSignal, sendSignal } from '@/lib/signaling';
import { ICE_SERVERS, POLL_INTERVAL } from './constants';

export function useWebRTCConnection(
    onDataChannel: (channel: RTCDataChannel) => void,
    isTransferFinished: () => boolean,
) {
    const { t } = useTranslation('common');
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const dcRef = useRef<RTCDataChannel | null>(null);

    const { connectionStatus, setConnectionStatus, connectionCode, mode } =
        useAppStore();

    const cleanup = useCallback(() => {
        pcRef.current?.close();
        pcRef.current = null;
        dcRef.current = null;
    }, []);

    const initializePeerConnection = useCallback(() => {
        const pc = new RTCPeerConnection({
            iceServers: ICE_SERVERS,
        });

        pc.oniceconnectionstatechange = () => {
            if (pc.iceConnectionState === 'failed') {
                if (isTransferFinished()) return;

                // Don't trigger error if we are already disconnecting
                const currentStatus = useAppStore.getState().connectionStatus;
                if (currentStatus === 'disconnected') return;

                setConnectionStatus('error');
                toast.error(t('toast.connection_issue'));
            }
        };

        pc.ondatachannel = (event) => {
            onDataChannel(event.channel);
            dcRef.current = event.channel;
        };

        pcRef.current = pc;
        return pc;
    }, [setConnectionStatus, onDataChannel, isTransferFinished, t]);

    // TanStack Query for Signaling
    const targetSignalType = mode === 'host' ? 'answer' : 'offer';
    const { data: remoteSignal } = useQuery({
        queryKey: ['signaling', connectionCode, targetSignalType],
        queryFn: ({ signal }) =>
            pollSignal(connectionCode, targetSignalType, signal),
        enabled: connectionStatus === 'connecting' && !!connectionCode,
        refetchInterval: POLL_INTERVAL,
        staleTime: 0,
        gcTime: 0,
    });

    // Reaction to remote signal (Handshake)
    useEffect(() => {
        if (
            !remoteSignal ||
            connectionStatus !== 'connecting' ||
            !pcRef.current ||
            pcRef.current.remoteDescription
        )
            return;

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
                        });
                    };

                    pcRef.current!.onicecandidate = (e) => {
                        if (e.candidate === null) sendAnswer();
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
        t,
    ]);

    return {
        pcRef,
        dcRef,
        cleanup,
        initializePeerConnection,
    };
}
