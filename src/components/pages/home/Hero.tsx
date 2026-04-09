import { UploadIcon } from 'lucide-react';

export const Hero = () => (
    <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary shadow-lg shadow-primary/20 rotate-3 transform hover:rotate-0 transition-transform duration-300">
            <UploadIcon className="w-10 h-10 text-primary-foreground" />
        </div>
        <div className="space-y-1">
            <h1 className="text-5xl font-extrabold tracking-tight text-foreground bg-clip-text bg-linear-to-r from-primary to-primary/60">
                Sendly
            </h1>
            <p className="text-muted-foreground text-lg">
                Direct, private, and fast. No middleman.
            </p>
        </div>
    </div>
);
