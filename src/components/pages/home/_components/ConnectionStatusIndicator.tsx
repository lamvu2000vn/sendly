import { ConnectionStatus } from '@/store/useAppStore';
import { useTranslation } from 'react-i18next';

interface ConnectionStatusIndicatorProps {
    status: ConnectionStatus;
}

export const ConnectionStatusIndicator = ({
    status,
}: ConnectionStatusIndicatorProps) => {
    const { t } = useTranslation();
    const statusColors: Record<ConnectionStatus, string> = {
        connected: 'bg-green-500',
        connecting: 'bg-yellow-500',
        error: 'bg-red-500',
        disconnected: 'bg-gray-400',
    };

    const color = statusColors[status] || 'bg-gray-400';

    return (
        <div className="bg-muted flex items-center gap-2 rounded-full px-3 py-2">
            <div className={`h-2 w-2 animate-pulse rounded-full ${color}`} />
            <span className="text-xs font-semibold tracking-wider uppercase opacity-70">
                {t(`status.${status}` as any)}
            </span>
        </div>
    );
};
