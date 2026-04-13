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
        <div className="flex flex-col gap-8 animate-in zoom-in-95 duration-500">
            <div className="flex flex-col gap-8 min-h-0">
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

            <div className="flex justify-center pt-6 border-t border-border/10">
                <Button
                    variant={isConnected ? 'destructive' : 'secondary'}
                    level="secondary"
                    className="h-11 px-8 rounded-2xl"
                    onClick={onDisconnect}
                >
                    <XCircle className="w-4 h-4 mr-2" />
                    {isConnected
                        ? t('connected.end_session')
                        : t('connected.leave')}
                </Button>
            </div>
        </div>
    );
};
