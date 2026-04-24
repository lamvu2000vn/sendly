'use client';

import { Button } from '@/components/ui/button';
import { Download, Trash2, File } from 'lucide-react';
import { type TransferState } from '@/store/useTransferStore';
import { m, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { TransferItem } from './TransferItem';

interface TransferProgressProps {
    transferState: TransferState;
    onClear: () => void;
    onDeleteFile: (id: string) => void;
    onCancel: (id: string) => void;
}

export const TransferProgress = ({
    transferState,
    onClear,
    onDeleteFile,
    onCancel,
}: TransferProgressProps) => {
    const { t } = useTranslation();
    const handleDownloadAll = () => {
        transferState.files.forEach((file) => {
            if (
                file.type === 'received' &&
                file.status === 'completed' &&
                file.objectUrl
            ) {
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
        (f) => f.status === 'completed',
    ).length;

    const allCompleted =
        transferState.files.length > 0 &&
        transferState.files.every((f) => f.status === 'completed');

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between px-2">
                <div className="flex flex-col">
                    <h3 className="text-primary/70 text-[10px] font-black tracking-[0.3em] uppercase">
                        {transferState.isReceiving
                            ? t('connected.incoming')
                            : t('connected.outgoing')}
                    </h3>
                    <div className="mt-1 flex items-center gap-2">
                        <div className="from-primary to-accent h-1 w-8 rounded-full bg-linear-to-r" />
                        <span className="text-xs font-bold opacity-40">
                            {transferState.files.length} {t('connected.files')}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {transferState.files.some((f) => f.type === 'received') &&
                        completedFilesCount > 1 && (
                            <Button
                                size="sm"
                                variant="secondary"
                                className="bg-secondary/50 hover:bg-secondary/80 h-9 rounded-lg border px-4 text-[11px] font-bold tracking-wider uppercase transition-all"
                                onClick={handleDownloadAll}
                            >
                                <Download className="mr-2 h-3.5 w-3.5" />
                                {t('connected.download_all')}
                            </Button>
                        )}
                    {allCompleted && (
                        <Button
                            size="sm"
                            variant="ghost"
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-9 rounded-lg px-4 text-[11px] font-bold tracking-wider uppercase"
                            onClick={onClear}
                        >
                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                            {t('connected.clear')}
                        </Button>
                    )}
                </div>
            </div>

            <div className="custom-scrollbar -mx-6 max-h-[400px] overflow-x-hidden overflow-y-auto px-6">
                <div className="space-y-4 px-2 pt-2 pb-8">
                    <AnimatePresence mode="popLayout" initial={false}>
                        {transferState.files.map((file) => (
                            <TransferItem
                                key={file.id}
                                file={file}
                                onDeleteFile={onDeleteFile}
                                onCancel={onCancel}
                            />
                        ))}
                    </AnimatePresence>

                    {transferState.files.length === 0 && (
                        <m.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-4 py-16 text-center"
                        >
                            <div className="bg-muted/50 border-border/50 relative mx-auto flex size-16 items-center justify-center rounded-2xl border">
                                <File className="text-muted-foreground/40 h-6 w-6" />
                                <m.div
                                    className="border-primary/20 absolute inset-0 rounded-2xl border"
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        opacity: [0.3, 0, 0.3],
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                    }}
                                />
                            </div>
                            <div className="space-y-1">
                                <p className="text-muted-foreground/60 text-[10px] font-black tracking-[0.2em] uppercase">
                                    {t('connected.ready_for_data')}
                                </p>
                                <p className="text-muted-foreground/40 mx-auto max-w-[180px] text-[10px] leading-relaxed font-medium">
                                    {t('connected.drag_and_drop_hint')}
                                </p>
                            </div>
                        </m.div>
                    )}
                </div>
            </div>
        </div>
    );
};
