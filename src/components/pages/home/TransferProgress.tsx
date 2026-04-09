import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { DownloadIcon, RefreshCwIcon } from 'lucide-react';
import { TransferState } from '@/hooks/useWebRTC';

interface TransferProgressProps {
    transferState: TransferState;
}

export const TransferProgress = ({ transferState }: TransferProgressProps) => {
    return (
        <div className="bg-muted/40 p-5 rounded-xl border border-border space-y-4 animate-in slide-in-from-top-2">
            <div className="flex justify-between text-sm">
                <span className="font-bold truncate max-w-60">
                    {transferState.fileName}
                </span>
                <span className="text-muted-foreground font-medium">
                    {(transferState.fileSize / 1024 / 1024).toFixed(2)} MB
                </span>
            </div>
            <div className="relative pt-1">
                <Progress
                    value={transferState.progress}
                    className="h-3 shadow-inner"
                />
            </div>
            <div className="flex justify-between text-sm items-center">
                <span className="text-primary font-semibold flex items-center gap-2">
                    <RefreshCwIcon
                        className={`w-3 h-3 ${transferState.progress < 100 ? 'animate-spin' : ''}`}
                    />
                    {transferState.isReceiving ? 'Receiving' : 'Sending'} —{' '}
                    {Math.round(transferState.progress)}%
                </span>
                {transferState.objectUrl && transferState.progress === 100 && (
                    <Button
                        size="sm"
                        asChild
                        className="rounded-full shadow-lg hover:shadow-primary/20 transition-all"
                    >
                        <a
                            href={transferState.objectUrl}
                            download={transferState.fileName}
                        >
                            <DownloadIcon className="w-4 h-4 mr-2" />
                            Save File
                        </a>
                    </Button>
                )}
            </div>
        </div>
    );
};
