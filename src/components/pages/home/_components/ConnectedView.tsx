import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import { type TransferState } from '@/store/useTransferStore';
import { FileDropZone } from './FileDropZone';
import { TransferProgress } from './TransferProgress';

interface ConnectedViewProps {
    isConnected: boolean;
    transferState: TransferState | null;
    onFileSelect: (files: File[]) => void;
    onDisconnect: () => void;
    onClearTransfer: () => void;
    onDeleteFile: (id: string) => void;
    onCancel: (id: string) => void;
}

import { useTranslation } from 'react-i18next';

export const ConnectedView = ({
    isConnected,
    transferState,
    onFileSelect,
    onDisconnect,
    onClearTransfer,
    onDeleteFile,
    onCancel,
}: ConnectedViewProps) => {
    const { t } = useTranslation();
    return (
        <div className="animate-in zoom-in-95 flex flex-col gap-8 duration-500">
            <div className="flex min-h-0 flex-col gap-8">
                {isConnected && <FileDropZone onFileSelect={onFileSelect} />}

                {transferState && (
                    <TransferProgress
                        transferState={transferState}
                        onClear={onClearTransfer}
                        onDeleteFile={onDeleteFile}
                        onCancel={onCancel}
                    />
                )}
            </div>

            <div className="border-border/10 flex justify-center border-t pt-6">
                <Button
                    variant={isConnected ? 'destructive' : 'secondary'}
                    level="secondary"
                    className="h-11 rounded-2xl px-8"
                    onClick={onDisconnect}
                >
                    <XCircle className="mr-2 h-4 w-4" />
                    {isConnected
                        ? t('connected.end_session')
                        : t('connected.leave')}
                </Button>
            </div>
        </div>
    );
};
