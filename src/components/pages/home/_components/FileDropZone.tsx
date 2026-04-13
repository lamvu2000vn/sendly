import { FileIcon, UploadCloud, Plus } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
            <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={cn(
                    'group relative border-2 border-dashed border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 p-8 rounded-3xl text-center transition-all duration-500 cursor-pointer overflow-hidden',
                    'glass-morphism shadow-sm',
                )}
                onClick={handleDropZoneClick}
                onDragOver={(e) => e.preventDefault()}
            >
                {/* Decorative background glow */}
                <div className="absolute -top-20 -right-20 size-40 bg-primary/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-primary/20 transition-colors" />
                <div className="absolute -bottom-20 -left-20 size-40 bg-accent/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-accent/20 transition-colors" />

                <div className="relative z-10 py-4">
                    <div className="mx-auto w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 relative">
                        <FileIcon className="w-9 h-9 text-primary transition-transform duration-500 group-hover:rotate-6" />
                        <div className="absolute -bottom-2 -right-2 size-8 bg-primary text-primary-foreground rounded-xl flex items-center justify-center shadow-lg transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                            <Plus className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold tracking-tight">
                            {t('drop_zone.title')}
                        </h3>
                        <p className="text-sm text-muted-foreground/60 font-medium">
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
            </motion.div>

            {typeof document !== 'undefined' &&
                createPortal(
                    <AnimatePresence>
                        {isDragging && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-100 bg-primary/95 backdrop-blur-md flex flex-col items-center justify-center text-primary-foreground p-6"
                            >
                                <motion.div
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
                                    <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mb-4">
                                        <UploadCloud className="w-16 h-16 animate-bounce" />
                                    </div>
                                    <h2 className="text-4xl font-bold tracking-tight">
                                        {t('drop_zone.overlay_title')}
                                    </h2>
                                    <p className="text-xl opacity-80 max-w-md">
                                        {t('drop_zone.overlay_subtitle')}
                                    </p>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>,
                    document.body,
                )}
        </div>
    );
};
