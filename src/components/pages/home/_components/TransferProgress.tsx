'use client';

import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
    Download,
    RefreshCw,
    Trash2,
    CheckCircle2,
    File,
    FileText,
    FileImage,
    FileVideo,
    FileArchive,
    FileAudio,
    FileCode,
    XCircle,
    ArrowUpRight,
    ArrowDownLeft,
} from 'lucide-react';
import { type TransferState } from '@/store/useTransferStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TransferProgressProps {
    transferState: TransferState;
    onClear: () => void;
    onDeleteFile: (id: string) => void;
    onCancel: (id: string) => void;
}

const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
        case 'svg':
        case 'webp':
            return <FileImage className="w-5 h-5" />;
        case 'mp4':
        case 'mov':
        case 'avi':
        case 'mkv':
            return <FileVideo className="w-5 h-5" />;
        case 'pdf':
        case 'doc':
        case 'docx':
            return <FileText className="w-5 h-5" />;
        case 'zip':
        case 'rar':
        case '7z':
        case 'tar':
        case 'gz':
            return <FileArchive className="w-5 h-5" />;
        case 'mp3':
        case 'wav':
        case 'ogg':
        case 'flac':
            return <FileAudio className="w-5 h-5" />;
        case 'js':
        case 'ts':
        case 'tsx':
        case 'jsx':
        case 'html':
        case 'css':
        case 'json':
        case 'py':
        case 'go':
        case 'rs':
            return <FileCode className="w-5 h-5" />;
        default:
            return <File className="w-5 h-5" />;
    }
};

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
            <div className="flex justify-between items-center px-2">
                <div className="flex flex-col">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">
                        {transferState.isReceiving
                            ? t('connected.incoming')
                            : t('connected.outgoing')}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="h-1 w-8 rounded-full bg-linear-to-r from-primary to-accent" />
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
                                className="h-9 px-4 text-[11px] font-bold uppercase tracking-wider rounded-xl glass hover:shadow-lg transition-all"
                                onClick={handleDownloadAll}
                            >
                                <Download className="w-3.5 h-3.5 mr-2" />
                                {t('connected.download_all')}
                            </Button>
                        )}
                    {allCompleted && (
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-9 px-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                            onClick={onClear}
                        >
                            <Trash2 className="w-3.5 h-3.5 mr-2" />
                            {t('connected.clear')}
                        </Button>
                    )}
                </div>
            </div>

            <ScrollArea className="max-h-[600px] -mx-6 px-6">
                <div className="pt-2 pb-8 px-2 space-y-4">
                <AnimatePresence mode="popLayout" initial={false}>
                    {transferState.files.map((file, i) => {
                        const isSuccess = file.status === 'completed';
                        const isTransferring = file.status === 'transferring';
                        const isCancelled = file.status === 'cancelled';
                        const isError = file.status === 'error';

                        return (
                            <motion.div
                                key={file.id}
                                layout
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{
                                    opacity: 0,
                                    scale: 0.9,
                                    transition: { duration: 0.2 },
                                }}
                                whileHover={{
                                    scale: 1.01,
                                    transition: { duration: 0.2 },
                                }}
                                className={cn(
                                    'relative group p-5 rounded-3xl border transition-all duration-500',
                                    'glass-morphism',
                                    isSuccess && 'border-primary/30',
                                    isTransferring && 'border-accent/40',
                                    (isCancelled || isError) &&
                                        'border-destructive/30 opacity-70 grayscale-[0.3]',
                                    !isSuccess &&
                                        !isTransferring &&
                                        !isCancelled &&
                                        !isError &&
                                        'border-white/10 hover:border-white/20',
                                )}
                            >
                                {/* Animated background for transferring state */}
                                {isTransferring && (
                                    <motion.div
                                        className="absolute inset-0 rounded-3xl bg-linear-to-r from-accent/5 via-transparent to-primary/5 pointer-events-none"
                                        animate={{
                                            backgroundPosition: [
                                                '0% 50%',
                                                '100% 50%',
                                                '0% 50%',
                                            ],
                                        }}
                                        transition={{
                                            duration: 5,
                                            repeat: Infinity,
                                            ease: 'linear',
                                        }}
                                        style={{ backgroundSize: '200% 200%' }}
                                    />
                                )}

                                <div className="flex items-start gap-5 relative z-10">
                                    <div
                                        className={cn(
                                            'size-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110',
                                            isSuccess
                                                ? 'bg-primary/20 text-primary'
                                                : isTransferring
                                                  ? 'bg-accent/20 text-accent animate-pulse'
                                                  : isCancelled || isError
                                                    ? 'bg-destructive/20 text-destructive'
                                                    : 'bg-muted/50 text-muted-foreground',
                                        )}
                                    >
                                        {isSuccess ? (
                                            <CheckCircle2 className="w-6 h-6" />
                                        ) : (
                                            getFileIcon(file.fileName)
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0 flex flex-col gap-3">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="space-y-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p
                                                        className="text-[15px] font-bold truncate leading-tight tracking-tight"
                                                        title={file.fileName}
                                                    >
                                                        {file.fileName}
                                                    </p>
                                                    {file.type === 'sent' ? (
                                                        <ArrowUpRight className="w-3 h-3 text-orange-500/60 shrink-0" />
                                                    ) : (
                                                        <ArrowDownLeft className="w-3 h-3 text-blue-500/60 shrink-0" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">
                                                        {(
                                                            file.fileSize /
                                                            1024 /
                                                            1024
                                                        ).toFixed(2)}{' '}
                                                        MB
                                                    </span>
                                                    <span className="w-0.5 h-0.5 rounded-full bg-border" />
                                                    <span
                                                        className={cn(
                                                            'text-[10px] font-black uppercase tracking-widest',
                                                            file.type === 'sent'
                                                                ? 'text-orange-500/70'
                                                                : 'text-blue-500/70',
                                                        )}
                                                    >
                                                        {t(
                                                            `connected.${file.type}`,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex gap-1 shrink-0">
                                                {(isTransferring ||
                                                    file.status ===
                                                        'pending') && (
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="size-9 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                                        onClick={() =>
                                                            onCancel(file.id)
                                                        }
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </Button>
                                                )}

                                                {isSuccess && (
                                                    <div className="flex gap-1.5">
                                                        {file.type ===
                                                            'received' &&
                                                            file.objectUrl && (
                                                                <Button
                                                                    size="icon"
                                                                    variant="secondary"
                                                                    asChild
                                                                    className="size-9 rounded-xl glass transition-all"
                                                                >
                                                                    <a
                                                                        href={
                                                                            file.objectUrl
                                                                        }
                                                                        download={
                                                                            file.fileName
                                                                        }
                                                                    >
                                                                        <Download className="w-4 h-4" />
                                                                    </a>
                                                                </Button>
                                                            )}
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="size-9 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                                            onClick={() =>
                                                                onDeleteFile(
                                                                    file.id,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between items-end">
                                                <div className="flex items-center gap-2">
                                                    {isTransferring && (
                                                        <RefreshCw className="w-3 h-3 animate-spin text-accent" />
                                                    )}
                                                    <span
                                                        className={cn(
                                                            'text-[10px] font-black uppercase tracking-[0.2em]',
                                                            isSuccess
                                                                ? 'text-primary'
                                                                : 'text-muted-foreground/60',
                                                            (isCancelled ||
                                                                isError) &&
                                                                'text-destructive',
                                                        )}
                                                    >
                                                        {t(
                                                            `connected.status.${file.status}` as any,
                                                        )}
                                                    </span>
                                                </div>
                                                <span
                                                    className={cn(
                                                        'text-[11px] font-black tabular-nums tracking-wider',
                                                        isSuccess
                                                            ? 'text-primary'
                                                            : 'text-primary/70',
                                                        (isCancelled ||
                                                            isError) &&
                                                            'text-destructive',
                                                    )}
                                                >
                                                    {Math.round(file.progress)}%
                                                </span>
                                            </div>
                                            <div className="relative group/progress">
                                                <Progress
                                                    value={file.progress}
                                                    className="h-2 bg-white/5 overflow-hidden rounded-full"
                                                    indicatorClassName={cn(
                                                        'transition-all duration-500 ease-out',
                                                        isTransferring &&
                                                            'bg-linear-to-r from-primary to-accent active-progress-glow',
                                                        (isCancelled ||
                                                            isError) &&
                                                            'bg-destructive',
                                                        isSuccess &&
                                                            'bg-primary',
                                                    )}
                                                />
                                                {isTransferring && (
                                                    <motion.div
                                                        className="absolute top-0 bottom-0 w-20 bg-white/30 blur-md pointer-events-none"
                                                        animate={{
                                                            left: [
                                                                '-20%',
                                                                '120%',
                                                            ],
                                                        }}
                                                        transition={{
                                                            duration: 1.5,
                                                            repeat: Infinity,
                                                            ease: 'easeInOut',
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {transferState.files.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-20 text-center space-y-5"
                    >
                        <div className="size-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5 relative">
                            <File className="w-8 h-8 text-muted-foreground/30" />
                            <motion.div
                                className="absolute inset-0 rounded-full border border-primary/20"
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.5, 0, 0.5],
                                    }}
                                transition={{ duration: 3, repeat: Infinity }}
                            />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/50">
                                {t('connected.ready_for_data')}
                            </p>
                            <p className="text-[10px] text-muted-foreground/30 font-medium max-w-[200px] mx-auto leading-relaxed">
                                {t('connected.drag_and_drop_hint')}
                            </p>
                        </div>
                    </motion.div>
                )}
                </div>
            </ScrollArea>

            <style jsx>{`
                .active-progress-glow {
                    opacity: 0.8;
                }
            `}</style>
        </div>
    );
};
