'use client';

import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw, Trash2, CheckCircle2, File } from 'lucide-react';
import { type TransferState } from '@/store/useTransferStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface TransferProgressProps {
    transferState: TransferState;
    onClear: () => void;
    onDeleteFile: (id: string) => void;
}

export const TransferProgress = ({
    transferState,
    onClear,
    onDeleteFile,
}: TransferProgressProps) => {
    const { t } = useTranslation();
    const handleDownloadAll = () => {
        transferState.files.forEach((file) => {
            if (file.status === 'completed' && file.objectUrl) {
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
        <div className="space-y-6">
            <div className="flex justify-between items-center px-1">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                    {transferState.isReceiving
                        ? t('connected.incoming')
                        : t('connected.outgoing')}
                </h3>
                <div className="flex items-center gap-2">
                    {transferState.isReceiving && completedFilesCount > 1 && (
                        <Button
                            size="sm"
                            variant="secondary"
                            className="h-8 text-[10px] font-bold uppercase tracking-wider rounded-lg"
                            onClick={handleDownloadAll}
                        >
                            <Download className="w-3 h-3 mr-2" />
                            {t('connected.download_all')}
                        </Button>
                    )}
                    {allCompleted && (
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-destructive"
                            onClick={onClear}
                        >
                            <Trash2 className="w-3 h-3 mr-2" />
                            {t('connected.clear')}
                        </Button>
                    )}
                </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4 custom-scrollbar px-1">
                <AnimatePresence mode="popLayout">
                    {transferState.files.map((file, i) => {
                        const isSuccess = file.status === 'completed';
                        const isTransferring = file.status === 'transferring';

                        return (
                            <motion.div
                                key={file.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: i * 0.05 }}
                                className="relative group p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                        {isSuccess ? (
                                            <CheckCircle2 className="w-5 h-5 text-primary" />
                                        ) : (
                                            <File className="w-5 h-5 text-muted-foreground" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0 space-y-3">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="space-y-0.5 min-w-0">
                                                <p
                                                    className="text-sm font-bold truncate pr-2"
                                                    title={file.fileName}
                                                >
                                                    {file.fileName}
                                                </p>
                                                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                                                    {(
                                                        file.fileSize /
                                                        1024 /
                                                        1024
                                                    ).toFixed(2)}{' '}
                                                    MB
                                                </p>
                                            </div>

                                            {isSuccess &&
                                                transferState.isReceiving && (
                                                    <div className="flex gap-1">
                                                        {file.objectUrl && (
                                                            <Button
                                                                size="icon"
                                                                variant="secondary"
                                                                asChild
                                                                className="size-8 rounded-lg shadow-sm"
                                                            >
                                                                <a
                                                                    href={
                                                                        file.objectUrl
                                                                    }
                                                                    download={
                                                                        file.fileName
                                                                    }
                                                                >
                                                                    <Download className="w-3.5 h-3.5" />
                                                                </a>
                                                            </Button>
                                                        )}
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                            onClick={() =>
                                                                onDeleteFile(
                                                                    file.id,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>
                                                )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                                <span
                                                    className={
                                                        isSuccess
                                                            ? 'text-primary'
                                                            : 'text-muted-foreground'
                                                    }
                                                >
                                                    {isTransferring && (
                                                        <RefreshCw className="w-2.5 h-2.5 animate-spin inline mr-1" />
                                                    )}
                                                    {t(
                                                        `connected.status.${file.status}` as any,
                                                    )}
                                                </span>
                                                <span className="text-primary">
                                                    {Math.round(file.progress)}%
                                                </span>
                                            </div>
                                            <Progress
                                                value={file.progress}
                                                className="h-1.5 bg-white/5 overflow-hidden"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {transferState.files.length === 0 && (
                    <div className="py-12 text-center space-y-3 opacity-30">
                        <File className="w-12 h-12 mx-auto text-muted-foreground" />
                        <p className="text-xs font-bold uppercase tracking-widest">
                            {t('connected.ready_for_data')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
