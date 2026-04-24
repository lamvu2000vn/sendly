import { useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from '@/store/useNotificationStore';
import { useTransferStore, type FileTransfer } from '@/store/useTransferStore';
import { saveChunk, clearStorage, getBlobFromStorage } from '@/lib/fileStorage';
import { WebRTCMessageSchema } from '@/types/schemas';
import { calculateFileHash } from '@/utils/crypto';

export function useFileReceiver() {
    const { t } = useTranslation('common');
    const { transferState, addFiles, updateFileProgress } = useTransferStore();

    const transferFilesRef = useRef<FileTransfer[]>([]);
    const currentFileRef = useRef<{
        id: string;
        name: string;
        size: number;
        received: number;
        expectedHash?: string;
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

    const hasAnyFiles = useCallback(() => {
        return transferFilesRef.current.length > 0;
    }, []);

    const handleMessage = useCallback(
        async (event: MessageEvent) => {
            try {
                if (typeof event.data === 'string') {
                    const rawMsg = JSON.parse(event.data);
                    const validation = WebRTCMessageSchema.safeParse(rawMsg);

                    if (!validation.success) {
                        console.error(
                            'Invalid WebRTC message received',
                            validation.error,
                        );
                        return;
                    }

                    const msg = validation.data;

                    if (msg.type === 'manifest') {
                        const newFiles: FileTransfer[] = msg.files.map((f) => ({
                            ...f,
                            progress: 0,
                            status: 'pending' as const,
                            type: 'received' as const,
                            hash: f.hash,
                        }));

                        addFiles(newFiles, true);
                    } else if (msg.type === 'file-start') {
                        currentFileRef.current = {
                            id: msg.fileId,
                            name: msg.fileName,
                            size: msg.fileSize,
                            received: 0,
                            expectedHash: msg.hash,
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
                        // Keep as transferring until integrity check is done
                        updateFileProgress(
                            file.id,
                            (file.received / file.size) * 100,
                            'transferring',
                        );
                    }

                    if (isComplete) {
                        const blob = await getBlobFromStorage(file.id);

                        // Verify Integrity
                        if (file.expectedHash) {
                            const actualHash = await calculateFileHash(blob);
                            if (actualHash !== file.expectedHash) {
                                console.error('Integrity check failed!', {
                                    expected: file.expectedHash,
                                    actual: actualHash,
                                });
                                updateFileProgress(file.id, 100, 'error');
                                toast.error(t('toast.integrity_error'));
                                // Only reset if this is still the active file
                                if (currentFileRef.current?.id === file.id) {
                                    currentFileRef.current = null;
                                }
                                return;
                            }
                        }

                        const url = URL.createObjectURL(blob);
                        updateFileProgress(file.id, 100, 'completed', url);
                        toast.success(t('toast.received', { name: file.name }));

                        // Only reset if this is still the active file
                        if (currentFileRef.current?.id === file.id) {
                            currentFileRef.current = null;
                        }
                    }
                }
            } catch (error) {
                console.error('Data channel message error', error);
                toast.error(t('toast.receive_error'));
            }
        },
        [addFiles, updateFileProgress, t],
    );

    return {
        handleMessage,
        isTransferFinished,
        hasSuccessfulFiles,
        hasAnyFiles,
    };
}
