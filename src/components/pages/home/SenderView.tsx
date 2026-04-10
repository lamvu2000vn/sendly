import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CopyIcon, ZapIcon } from 'lucide-react';

interface SenderViewProps {
    connectionCode: string;
    isConnecting: boolean;
    onStart: () => void;
    onCopy: () => void;
    onCancel: () => void;
}

export const SenderView = ({
    connectionCode,
    isConnecting,
    onStart,
    onCopy,
    onCancel,
}: SenderViewProps) => {
    if (!connectionCode && !isConnecting) {
        return (
            <div className="text-center py-8 space-y-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <ZapIcon className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-4">
                    <p className="text-muted-foreground text-sm">
                        Start a new session to get a 8-digit connection code.
                    </p>
                    <Button
                        className="w-full h-12 text-lg rounded-xl shadow-lg shadow-primary/20"
                        onClick={onStart}
                    >
                        Start Sending
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 py-4">
            <div className="text-center space-y-4">
                <Label className="text-sm text-muted-foreground uppercase tracking-widest font-bold">
                    Your Connection Code
                </Label>
                <div className="flex items-center justify-center gap-2">
                    {connectionCode ? (
                        <div className="flex gap-2">
                            {connectionCode.split('').map((char, i) => (
                                <span
                                    key={i}
                                    className="size-12 flex items-center justify-center bg-card border-2 border-primary/20 rounded-full text-3xl font-black text-primary shadow-sm"
                                >
                                    {char}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <div className="h-14 flex items-center justify-center gap-2 italic text-muted-foreground">
                            Generating your code...
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col items-center gap-4 pt-4">
                {connectionCode && (
                    <Button
                        variant="outline"
                        className="rounded-full px-6"
                        onClick={onCopy}
                    >
                        <CopyIcon className="w-4 h-4 mr-2" />
                        Copy Code
                    </Button>
                )}
                <p className="text-[10px] text-muted-foreground bg-muted p-2 rounded-lg text-center max-w-50">
                    {isConnecting
                        ? 'Waiting for receiver to join...'
                        : 'Share this code with the receiver.'}
                </p>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onCancel}
                    className="text-muted-foreground"
                >
                    Cancel
                </Button>
            </div>
        </div>
    );
};
