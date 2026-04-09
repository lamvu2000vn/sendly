import { FileIcon } from 'lucide-react';
import { useRef } from 'react';

interface FileDropZoneProps {
    onFileSelect: (file: File) => void;
}

export const FileDropZone = ({ onFileSelect }: FileDropZoneProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    };

    return (
        <div
            className="group relative border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 p-10 rounded-2xl text-center transition-all duration-300 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
        >
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <FileIcon className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-2">
                <h3 className="text-xl font-semibold">Drop or Select File</h3>
                <p className="text-sm text-muted-foreground">
                    Unlimited file size, direct to peer.
                </p>
            </div>
            <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
            />
        </div>
    );
};
