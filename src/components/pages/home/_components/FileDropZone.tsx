import { FileIcon, UploadCloud } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

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
        <>
            <div
                className="group relative border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 p-10 rounded-2xl text-center transition-all duration-300 cursor-pointer"
                onClick={handleDropZoneClick}
                onDragOver={(e) => e.preventDefault()}
            >
                <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <FileIcon className="w-10 h-10 text-primary" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-semibold">
                        {t('drop_zone.title')}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {t('drop_zone.subtitle')}
                    </p>
                </div>
                <input
                    type="file"
                    multiple
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />
            </div>

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
                                        {t(
                                            'drop_zone.overlay_title',
                                            'Drop files anywhere',
                                        )}
                                    </h2>
                                    <p className="text-xl opacity-80 max-w-md">
                                        {t(
                                            'drop_zone.overlay_subtitle',
                                            'Release to start sending your files instantly',
                                        )}
                                    </p>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>,
                    document.body,
                )}
        </>
    );
};
