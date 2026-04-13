import { useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useAppStore } from '@/store/useAppStore';
import { useTransferStore, type FileTransfer } from '@/store/useTransferStore';
import { saveChunk, clearStorage, getBlobFromStorage } from '@/lib/fileStorage';

export function useFileReceiver() {
    const { t } = useTranslation('common');
    const { mode } = useAppStore();
    const { transferState, addFiles, updateFileProgress } = useTransferStore();

    // Use a ref to track the latest files for closure safety in callbacks
    const transferFilesRef = useRef<FileTransfer[]>([]);
    useEffect(() => {
        transferFilesRef.current = transferState?.files || [];
    }, [transferState]);

    const currentFileRef = useRef<{
        id: string;
        name: string;
        size: number;
        received: number;
    } | null>(null);
    const lastUpdateRef = useRef<number>(0);

    const isReceiveComplete = useCallback(() => {
        return (
            mode === 'receiver' &&
            transferFilesRef.current.length > 0 &&
            transferFilesRef.current.every((f) => f.status === 'completed')
        );
    }, [mode]);

    const handleMessage = useCallback(
        async (event: MessageEvent) => {
            try {
                if (typeof event.data === 'string') {
                    const msg = JSON.parse(event.data);

                    if (msg.type === 'manifest') {
                        const newFiles: FileTransfer[] = msg.files.map(
                            (f: any) => ({
                                ...f,
                                progress: 0,
                                status: 'pending' as const,
                            }),
                        );
                        addFiles(newFiles, true);
                    } else if (msg.type === 'file-start') {
                        currentFileRef.current = {
                            id: msg.fileId,
                            name: msg.fileName,
                            size: msg.fileSize,
                            received: 0,
                        };
                        await clearStorage(msg.fileId);
                        updateFileProgress(msg.fileId, 0, 'transferring');
                    }
                } else if (event.data instanceof ArrayBuffer) {
                    const file = currentFileRef.current;
                    if (!file) return;

                    await saveChunk(file.id, event.data);
                    file.received += event.data.byteLength;

                    const now = Date.now();
                    const isComplete = file.received === file.size;

                    // Throttle progress updates to UI
                    if (isComplete || now - lastUpdateRef.current > 100) {
                        lastUpdateRef.current = now;
                        updateFileProgress(
                            file.id,
                            (file.received / file.size) * 100,
                            isComplete ? 'completed' : 'transferring',
                        );
                    }

                    if (isComplete) {
                        const blob = await getBlobFromStorage(file.id);
                        const url = URL.createObjectURL(blob);
                        updateFileProgress(file.id, 100, 'completed', url);
                        toast.success(t('toast.received', { name: file.name }));
                        currentFileRef.current = null;
                    }
                }
            } catch (error) {
                console.error('Data channel message error', error);
                toast.error(t('toast.receive_error'));
            }
        },
        [addFiles, updateFileProgress, t],
    );

    return { handleMessage, isReceiveComplete };
}
