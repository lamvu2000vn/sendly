import { create } from 'zustand';

export interface FileTransfer {
    id: string;
    fileName: string;
    fileSize: number;
    progress: number;
    status: 'pending' | 'transferring' | 'completed' | 'error';
    objectUrl?: string;
}

export interface TransferState {
    files: FileTransfer[];
    isReceiving: boolean;
}

interface TransferStore {
    transferState: TransferState | null;
    setTransferState: (
        state:
            | TransferState
            | null
            | ((prev: TransferState | null) => TransferState | null),
    ) => void;
    updateFileProgress: (
        fileId: string,
        progress: number,
        status?: FileTransfer['status'],
        objectUrl?: string,
    ) => void;
    addFiles: (files: FileTransfer[], isReceiving: boolean) => void;
    clearTransfers: () => void;
    deleteFile: (fileId: string) => void;
}

export const useTransferStore = create<TransferStore>((set) => ({
    transferState: null,
    setTransferState: (state) =>
        set((prev) => ({
            transferState:
                typeof state === 'function' ? state(prev.transferState) : state,
        })),
    updateFileProgress: (fileId, progress, status, objectUrl) =>
        set((state) => {
            if (!state.transferState) return state;
            return {
                transferState: {
                    ...state.transferState,
                    files: state.transferState.files.map((f) =>
                        f.id === fileId
                            ? {
                                  ...f,
                                  progress,
                                  ...(status ? { status } : {}),
                                  ...(objectUrl ? { objectUrl } : {}),
                              }
                            : f,
                    ),
                },
            };
        }),
    addFiles: (newFiles, isReceiving) =>
        set((state) => {
            const existingFiles = state.transferState?.files || [];
            const updatedFiles = [...existingFiles];

            newFiles.forEach((newFile) => {
                const index = updatedFiles.findIndex(
                    (f) => f.id === newFile.id,
                );
                if (index > -1) {
                    updatedFiles[index] = {
                        ...updatedFiles[index],
                        ...newFile,
                    };
                } else {
                    updatedFiles.push(newFile);
                }
            });

            return {
                transferState: {
                    isReceiving,
                    files: updatedFiles,
                },
            };
        }),
    clearTransfers: () =>
        set((state) => {
            if (state.transferState?.files) {
                state.transferState.files.forEach((f) => {
                    if (f.objectUrl) URL.revokeObjectURL(f.objectUrl);
                });
            }
            return { transferState: null };
        }),
    deleteFile: (fileId) =>
        set((state) => {
            if (!state.transferState) return state;
            const file = state.transferState.files.find((f) => f.id === fileId);
            if (file?.objectUrl) {
                URL.revokeObjectURL(file.objectUrl);
            }
            const updatedFiles = state.transferState.files.filter(
                (f) => f.id !== fileId,
            );
            if (updatedFiles.length === 0) return { transferState: null };
            return {
                transferState: {
                    ...state.transferState,
                    files: updatedFiles,
                },
            };
        }),
}));
