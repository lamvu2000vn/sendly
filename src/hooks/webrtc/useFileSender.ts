import { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useTransferStore, type FileTransfer } from '@/store/useTransferStore';
import { DEFAULT_CHUNK_SIZE, MAX_CHUNK_SIZE } from './constants';

export function useFileSender(dc: RTCDataChannel | null) {
    const { t } = useTranslation('common');
    const { addFiles, updateFileProgress } = useTransferStore();
    const resumeRef = useRef<(() => void) | null>(null);
    const lastUpdateRef = useRef<number>(0);

    const resumeSending = useCallback(() => {
        if (resumeRef.current) {
            const resume = resumeRef.current;
            resumeRef.current = null;
            resume();
        }
    }, []);

    const sendFiles = useCallback(
        async (files: File[]) => {
            if (!dc || dc.readyState !== 'open') return;

            const fileTransfers: FileTransfer[] = files.map((file) => ({
                id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
                fileName: file.name,
                fileSize: file.size,
                progress: 0,
                status: 'pending' as const,
                type: 'sent' as const,
            }));

            addFiles(fileTransfers, false);

            // Send manifest to inform receiver about upcoming files
            dc.send(
                JSON.stringify({
                    type: 'manifest',
                    files: fileTransfers.map((f) => ({
                        id: f.id,
                        fileName: f.fileName,
                        fileSize: f.fileSize,
                    })),
                }),
            );

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const transfer = fileTransfers[i];

                if (dc.readyState !== 'open') break;

                // Determine chunk size based on file size for efficiency
                let currentChunkSize = DEFAULT_CHUNK_SIZE;
                if (file.size > 1024 * 1024 * 1024)
                    currentChunkSize = 256 * 1024;
                else if (file.size > 50 * 1024 * 1024)
                    currentChunkSize = MAX_CHUNK_SIZE;
                else if (file.size > 1024 * 1024) currentChunkSize = 32 * 1024;

                const currentStatus = useTransferStore
                    .getState()
                    .transferState?.files.find(
                        (f) => f.id === transfer.id,
                    )?.status;

                if (currentStatus === 'cancelled') continue;

                dc.send(
                    JSON.stringify({
                        type: 'file-start',
                        fileId: transfer.id,
                        fileName: file.name,
                        fileSize: file.size,
                        chunkSize: currentChunkSize,
                    }),
                );

                updateFileProgress(transfer.id, 0, 'transferring');

                try {
                    await new Promise<void>((resolve, reject) => {
                        const reader = new FileReader();
                        let offset = 0;

                        const readNextChunk = () => {
                            // Check if file is cancelled before reading next chunk
                            const currentFile = useTransferStore
                                .getState()
                                .transferState?.files.find(
                                    (f) => f.id === transfer.id,
                                );
                            if (currentFile?.status === 'cancelled') {
                                dc.send(
                                    JSON.stringify({
                                        type: 'file-cancel',
                                        fileId: transfer.id,
                                    }),
                                );
                                reject(new Error('Transfer cancelled'));
                                return;
                            }

                            const slice = file.slice(
                                offset,
                                offset + currentChunkSize,
                            );
                            reader.readAsArrayBuffer(slice);
                        };

                        reader.onload = (e) => {
                            if (!dc || dc.readyState !== 'open') {
                                reject(new Error('Data channel closed'));
                                return;
                            }

                            // Check if file is cancelled during sending
                            const currentFile = useTransferStore
                                .getState()
                                .transferState?.files.find(
                                    (f) => f.id === transfer.id,
                                );
                            if (currentFile?.status === 'cancelled') {
                                dc.send(
                                    JSON.stringify({
                                        type: 'file-cancel',
                                        fileId: transfer.id,
                                    }),
                                );
                                reject(new Error('Transfer cancelled'));
                                return;
                            }

                            if (e.target?.result) {
                                try {
                                    const buffer = e.target
                                        .result as ArrayBuffer;
                                    dc.send(buffer);
                                    offset += buffer.byteLength;

                                    const now = Date.now();
                                    const progress = Math.min(
                                        (offset / file.size) * 100,
                                        100,
                                    );
                                    const isComplete = progress === 100;

                                    if (
                                        isComplete ||
                                        now - lastUpdateRef.current > 100
                                    ) {
                                        lastUpdateRef.current = now;
                                        updateFileProgress(
                                            transfer.id,
                                            progress,
                                            isComplete
                                                ? 'completed'
                                                : 'transferring',
                                        );
                                    }

                                    if (offset < file.size) {
                                        if (
                                            dc.bufferedAmount >
                                            dc.bufferedAmountLowThreshold
                                        ) {
                                            resumeRef.current = readNextChunk;
                                        } else {
                                            readNextChunk();
                                        }
                                    } else {
                                        toast.success(
                                            t('toast.sent', {
                                                name: file.name,
                                            }),
                                        );
                                        resolve();
                                    }
                                } catch (error) {
                                    reject(error);
                                }
                            }
                        };

                        reader.onerror = () =>
                            reject(new Error('FileReader error'));
                        readNextChunk();
                    });
                } catch (error: any) {
                    if (error.message !== 'Transfer cancelled') {
                        console.error('File send error:', error);
                        updateFileProgress(transfer.id, 0, 'error');
                    }
                }
            }
        },
        [dc, addFiles, updateFileProgress, t],
    );

    return { sendFiles, resumeSending };
}
