'use client';

import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNetwork } from '@/hooks/useNetwork';
import { toast } from '@/store/useNotificationStore';

export function NetworkMonitor() {
    const isOnline = useNetwork();
    const { t } = useTranslation();
    const prevOnlineRef = useRef<boolean>(isOnline);

    useEffect(() => {
        // Only trigger when changing from offline to online
        if (isOnline && !prevOnlineRef.current) {
            toast.success(t('toast.network_restored' as any));
        } else if (!isOnline && prevOnlineRef.current) {
            toast.error(t('toast.network_lost' as any));
        }
        prevOnlineRef.current = isOnline;
    }, [isOnline, t]);

    return null;
}
