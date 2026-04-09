import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CopyIcon, ZapIcon } from 'lucide-react';

interface SenderViewProps {
    connectionCode: string;
    isConnecting: boolean;
    expiryCountdown: number;
    onStart: () => void;
    onCopy: () => void;
    onCancel: () => void;
}

export const SenderView = ({
    connectionCode,
    isConnecting,
    expiryCountdown,
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
        <div className="space-y-8 animate-in slide-in-from-left-4 duration-500 py-4">
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
                                    className="w-10 h-14 flex items-center justify-center bg-card border-2 border-primary/20 rounded-xl text-3xl font-black text-primary shadow-sm"
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

                {connectionCode && (
                    <div className="w-full max-w-50 space-y-1.5">
                        <div className="flex justify-between text-[10px] text-muted-foreground px-1">
                            <span>Mã sẽ hết hạn sau</span>
                            <span className="font-mono font-medium">
                                {Math.floor(expiryCountdown / 60)}:
                                {(expiryCountdown % 60)
                                    .toString()
                                    .padStart(2, '0')}
                            </span>
                        </div>
                        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary/40 transition-all duration-1000 ease-linear"
                                style={{
                                    width: `${(expiryCountdown / 300) * 100}%`,
                                }}
                            />
                        </div>
                    </div>
                )}
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
