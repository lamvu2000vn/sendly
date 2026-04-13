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
        <div className="flex items-center gap-2 py-2 px-3 rounded-full bg-muted">
            <div className={`w-2 h-2 rounded-full animate-pulse ${color}`} />
            <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
                {t(`status.${status}` as any)}
            </span>
        </div>
    );
};
