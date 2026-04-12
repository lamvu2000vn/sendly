import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import { TransferState } from '@/hooks/useWebRTC';
import { FileDropZone } from './FileDropZone';
import { TransferProgress } from './TransferProgress';

interface ConnectedViewProps {
    transferState: TransferState | null;
    onFileSelect: (files: File[]) => void;
    onDisconnect: () => void;
    onClearTransfer: () => void;
    onDeleteFile: (id: string) => void;
}

import { useTranslation } from 'react-i18next';

export const ConnectedView = ({
    transferState,
    onFileSelect,
    onDisconnect,
    onClearTransfer,
    onDeleteFile,
}: ConnectedViewProps) => {
    const { t } = useTranslation();
    return (
        <div className="space-y-10 animate-in zoom-in-95 duration-500">
            <FileDropZone onFileSelect={onFileSelect} />

            {transferState && (
                <TransferProgress
                    transferState={transferState}
                    onClear={onClearTransfer}
                    onDeleteFile={onDeleteFile}
                />
            )}

            <div className="flex justify-center pt-2">
                <Button
                    variant="destructive"
                    level="secondary"
                    onClick={onDisconnect}
                >
                    <XCircle className="w-4 h-4 mr-2" />
                    {t('connected.end_session')}
                </Button>
            </div>
        </div>
    );
};
