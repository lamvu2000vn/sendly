import { ConnectionStatus } from '@/store/useAppStore';

interface ConnectionStatusIndicatorProps {
    status: ConnectionStatus;
}

export const ConnectionStatusIndicator = ({ status }: ConnectionStatusIndicatorProps) => {
    const statusColors: Record<ConnectionStatus, string> = {
        connected: 'bg-green-500',
        connecting: 'bg-yellow-500',
        error: 'bg-red-500',
        disconnected: 'bg-gray-400',
    };

    const color = statusColors[status] || 'bg-gray-400';

    return (
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${color}`} />
            <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
                {status}
            </span>
        </div>
    );
};
