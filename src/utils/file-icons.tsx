import {
    File,
    FileText,
    FileImage,
    FileVideo,
    FileArchive,
    FileAudio,
    FileCode,
} from 'lucide-react';

export const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
        case 'svg':
        case 'webp':
            return <FileImage className="h-5 w-5" />;
        case 'mp4':
        case 'mov':
        case 'avi':
        case 'mkv':
            return <FileVideo className="h-5 w-5" />;
        case 'pdf':
        case 'doc':
        case 'docx':
            return <FileText className="h-5 w-5" />;
        case 'zip':
        case 'rar':
        case '7z':
        case 'tar':
        case 'gz':
            return <FileArchive className="h-5 w-5" />;
        case 'mp3':
        case 'wav':
        case 'ogg':
        case 'flac':
            return <FileAudio className="h-5 w-5" />;
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
            return <FileCode className="h-5 w-5" />;
        default:
            return <File className="h-5 w-5" />;
    }
};
