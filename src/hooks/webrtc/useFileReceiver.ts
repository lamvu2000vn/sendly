import { useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from '@/store/useNotificationStore';
import { useTransferStore, type FileTransfer } from '@/store/useTransferStore';
import { saveChunk, clearStorage, getBlobFromStorage } from '@/lib/fileStorage';

export function useFileReceiver() {
    const { t } = useTranslation('common');
    const { transferState, addFiles, updateFileProgress } = useTransferStore();

    const transferFilesRef = useRef<FileTransfer[]>([]);
    const currentFileRef = useRef<{
        id: string;
        name: string;
        size: number;
        received: number;
    } | null>(null);
    const lastUpdateRef = useRef<number>(0);

    useEffect(() => {
        const files = transferState?.files || [];
        transferFilesRef.current = files;

        // If the current file being received is cancelled, reset currentFileRef
        if (currentFileRef.current) {
            const currentFile = files.find(
                (f) => f.id === currentFileRef.current?.id,
            );
            if (currentFile?.status === 'cancelled') {
                currentFileRef.current = null;
            }
        }
    }, [transferState]);

    const isTransferFinished = useCallback(() => {
        return (
            transferFilesRef.current.length > 0 &&
            transferFilesRef.current.every((f) =>
                ['completed', 'cancelled', 'error'].includes(f.status),
            )
        );
    }, []);

    const hasSuccessfulFiles = useCallback(() => {
        return transferFilesRef.current.some((f) => f.status === 'completed');
    }, []);

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
                                type: 'received' as const,
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
                    } else if (msg.type === 'file-cancel') {
                        const cancelledFile = transferFilesRef.current.find(
                            (f) => f.id === msg.fileId,
                        );

                        // Only proceed if not already cancelled
                        if (cancelledFile?.status !== 'cancelled') {
                            if (
                                currentFileRef.current &&
                                currentFileRef.current.id === msg.fileId
                            ) {
                                currentFileRef.current = null;
                            }
                            await clearStorage(msg.fileId);
                            updateFileProgress(msg.fileId, 0, 'cancelled');
                            toast.error(
                                t('toast.cancelled', {
                                    name: cancelledFile?.fileName || msg.fileId,
                                }),
                            );
                        }
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

    return { handleMessage, isTransferFinished, hasSuccessfulFiles };
}
