import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { DownloadIcon, RefreshCwIcon, Trash2 } from 'lucide-react';
import { TransferState } from '@/hooks/useWebRTC';

interface TransferProgressProps {
    transferState: TransferState;
    onClear: () => void;
    onDeleteFile: (id: string) => void;
}

export const TransferProgress = ({
    transferState,
    onClear,
    onDeleteFile,
}: TransferProgressProps) => {
    const handleDownloadAll = () => {
        transferState.files.forEach((file) => {
            if (file.status === 'completed' && file.objectUrl) {
                const a = document.createElement('a');
                a.href = file.objectUrl;
                a.download = file.fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        });
    };

    const completedFilesCount = transferState.files.filter(
        (f) => f.status === 'completed'
    ).length;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    {transferState.isReceiving ? 'Received Files' : 'Files being sent'}
                </h3>
                <div className="flex items-center gap-2">
                    {transferState.isReceiving && completedFilesCount > 0 && (
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-xs text-primary hover:text-primary hover:bg-primary/10"
                            onClick={handleDownloadAll}
                        >
                            <DownloadIcon className="w-3 h-3 mr-1" />
                            Download All ({completedFilesCount})
                        </Button>
                    )}
                    {transferState.files.every((f) => f.status === 'completed') && (
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-xs text-muted-foreground hover:text-destructive"
                            onClick={onClear}
                        >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Clear All
                        </Button>
                    )}
                </div>
            </div>
            <div className="max-h-[350px] overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                {transferState.files.map((file) => {
                    const isSuccess = file.status === 'completed';
                    const isTransferring = file.status === 'transferring';

                    return (
                        <div
                            key={file.id}
                            className="bg-muted/40 p-4 rounded-xl border border-border space-y-3 animate-in fade-in slide-in-from-top-1 duration-300"
                        >
                            <div className="flex justify-between text-sm gap-4">
                                <span className="font-bold truncate flex-1" title={file.fileName}>
                                    {file.fileName}
                                </span>
                                <span className="text-muted-foreground font-medium shrink-0">
                                    {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                                </span>
                            </div>

                            <div className="relative pt-1">
                                <Progress
                                    value={file.progress}
                                    className={`h-2 shadow-inner transition-all duration-300 ${isSuccess ? 'bg-green-100' : ''}`}
                                />
                                {isSuccess && (
                                    <div className="absolute -right-1 -top-1">
                                        <div className="bg-green-500 rounded-full p-0.5 shadow-sm">
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between text-xs items-center gap-2">
                                <span
                                    className={`font-semibold flex items-center gap-2 flex-1 ${
                                        isSuccess ? 'text-green-600' : 'text-primary'
                                    }`}
                                >
                                    {isTransferring && (
                                        <RefreshCwIcon className="w-3 h-3 animate-spin" />
                                    )}
                                    {file.status === 'pending' ? 'Waiting' : isSuccess ? 'Done' : 'Transferring'} —{' '}
                                    {Math.round(file.progress)}%
                                </span>

                                <div className="flex items-center gap-2">
                                    {isSuccess && (
                                        <div className="flex items-center gap-2">
                                            {file.objectUrl && (
                                                <Button
                                                    size="sm"
                                                    asChild
                                                    className="h-8 rounded-full shadow-md hover:shadow-primary/20 transition-all px-3"
                                                >
                                                    <a
                                                        href={file.objectUrl}
                                                        download={file.fileName}
                                                    >
                                                        <DownloadIcon className="w-3 h-3 mr-1.5" />
                                                        Save
                                                    </a>
                                                </Button>
                                            )}
                                            {transferState.isReceiving && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 border-border"
                                                    onClick={() => onDeleteFile(file.id)}
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
