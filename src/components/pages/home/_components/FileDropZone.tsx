import { FileIcon, UploadCloud, Plus } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { m, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FileDropZoneProps {
    onFileSelect: (files: File[]) => void;
}

export const FileDropZone = ({ onFileSelect }: FileDropZoneProps) => {
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const dragCounter = useRef(0);

    useEffect(() => {
        const handleDragEnter = (e: DragEvent) => {
            e.preventDefault();
            dragCounter.current++;
            if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
                setIsDragging(true);
            }
        };

        const handleDragLeave = (e: DragEvent) => {
            e.preventDefault();
            dragCounter.current--;
            if (dragCounter.current === 0) {
                setIsDragging(false);
            }
        };

        const handleDragOver = (e: DragEvent) => {
            e.preventDefault();
        };

        const handleDrop = (e: DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            dragCounter.current = 0;
            if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
                onFileSelect(Array.from(e.dataTransfer.files));
            }
        };

        window.addEventListener('dragenter', handleDragEnter);
        window.addEventListener('dragleave', handleDragLeave);
        window.addEventListener('dragover', handleDragOver);
        window.addEventListener('drop', handleDrop);

        return () => {
            window.removeEventListener('dragenter', handleDragEnter);
            window.removeEventListener('dragleave', handleDragLeave);
            window.removeEventListener('dragover', handleDragOver);
            window.removeEventListener('drop', handleDrop);
        };
    }, [onFileSelect]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onFileSelect(Array.from(e.target.files));
        }
    };

    const handleDropZoneClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="relative">
            <m.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={cn(
                    'group border-primary/40 bg-primary/10 hover:bg-primary/20 hover:border-primary/60 relative cursor-pointer overflow-hidden rounded-3xl border-4 border-dashed p-8 text-center transition-all duration-500',
                    'shadow-sm',
                )}
                onClick={handleDropZoneClick}
                onDragOver={(e) => e.preventDefault()}
            >
                {/* Decorative background glow */}
                <div className="bg-primary/10 group-hover:bg-primary/20 pointer-events-none absolute -top-20 -right-20 size-40 rounded-full blur-[60px] transition-colors" />
                <div className="bg-accent/10 group-hover:bg-accent/20 pointer-events-none absolute -bottom-20 -left-20 size-40 rounded-full blur-[60px] transition-colors" />

                <div className="relative z-10 py-4">
                    <div className="bg-primary/10 relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl transition-transform duration-500 group-hover:scale-110">
                        <FileIcon className="text-primary h-9 w-9 transition-transform duration-500 group-hover:rotate-6" />
                        <div className="bg-primary text-primary-foreground absolute -right-2 -bottom-2 flex size-8 translate-y-2 transform items-center justify-center rounded-xl opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                            <Plus className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold tracking-tight">
                            {t('drop_zone.title')}
                        </h3>
                        <p className="text-muted-foreground/60 text-sm font-medium">
                            {t('drop_zone.subtitle')}
                        </p>
                    </div>
                </div>

                <input
                    type="file"
                    multiple
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />
            </m.div>

            {typeof document !== 'undefined' &&
                createPortal(
                    <AnimatePresence>
                        {isDragging && (
                            <m.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="bg-primary/95 text-primary-foreground fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 backdrop-blur-md"
                            >
                                <m.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.5, opacity: 0 }}
                                    transition={{
                                        type: 'spring',
                                        damping: 20,
                                        stiffness: 300,
                                    }}
                                    className="flex flex-col items-center space-y-6 text-center"
                                >
                                    <div className="mb-4 flex h-32 w-32 items-center justify-center rounded-full bg-white/20">
                                        <UploadCloud className="h-16 w-16 animate-bounce" />
                                    </div>
                                    <h2 className="text-4xl font-bold tracking-tight">
                                        {t('drop_zone.overlay_title')}
                                    </h2>
                                    <p className="max-w-md text-xl opacity-80">
                                        {t('drop_zone.overlay_subtitle')}
                                    </p>
                                </m.div>
                            </m.div>
                        )}
                    </AnimatePresence>,
                    document.body,
                )}
        </div>
    );
};
