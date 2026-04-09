import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConnectionStatusIndicator } from './ConnectionStatusIndicator';
import { ConnectionStatus } from '@/store/useAppStore';

interface ConnectionCardProps {
    status: ConnectionStatus;
    children: React.ReactNode;
}

export const ConnectionCard = ({ status, children }: ConnectionCardProps) => (
    <Card className="glass-card shadow-2xl border-primary/10 overflow-hidden backdrop-blur-sm bg-white/50 dark:bg-black/50">
        <CardHeader className="pb-4">
            <CardTitle className="flex justify-between items-center text-xl">
                <span>Connection</span>
                <ConnectionStatusIndicator status={status} />
            </CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
    </Card>
);
