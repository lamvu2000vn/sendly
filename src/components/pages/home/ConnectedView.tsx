import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import { TransferState } from '@/hooks/useWebRTC';
import { FileDropZone } from './FileDropZone';
import { TransferProgress } from './TransferProgress';

interface ConnectedViewProps {
    transferState: TransferState | null;
    onFileSelect: (file: File) => void;
    onDisconnect: () => void;
    onClearTransfer: () => void;
}

export const ConnectedView = ({
    transferState,
    onFileSelect,
    onDisconnect,
    onClearTransfer,
}: ConnectedViewProps) => (
    <div className="space-y-6 py-4 animate-in zoom-in-95 duration-500">
        <FileDropZone onFileSelect={onFileSelect} />

        {transferState && (
            <TransferProgress
                transferState={transferState}
                onClear={onClearTransfer}
            />
        )}

        <div className="flex justify-center pt-2">
            <Button
                variant="ghost"
                className="text-destructive hover:bg-destructive/10 rounded-full px-6"
                onClick={onDisconnect}
            >
                <XCircle className="w-4 h-4 mr-2" />
                End Session
            </Button>
        </div>
    </div>
);
