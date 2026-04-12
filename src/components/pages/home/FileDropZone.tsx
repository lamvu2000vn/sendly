import { FileIcon } from 'lucide-react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface FileDropZoneProps {
    onFileSelect: (files: File[]) => void;
}

export const FileDropZone = ({ onFileSelect }: FileDropZoneProps) => {
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onFileSelect(Array.from(e.target.files));
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFileSelect(Array.from(e.dataTransfer.files));
        }
    };

    return (
        <div
            className="group relative border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 p-10 rounded-2xl text-center transition-all duration-300 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
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
    );
};
