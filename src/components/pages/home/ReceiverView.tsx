import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRightIcon, RefreshCwIcon } from 'lucide-react';

interface ReceiverViewProps {
    inputCode: string;
    isConnecting: boolean;
    onInputChange: (value: string) => void;
    onJoin: () => void;
    onCancel: () => void;
}

export const ReceiverView = ({
    inputCode,
    isConnecting,
    onInputChange,
    onJoin,
    onCancel,
}: ReceiverViewProps) => (
    <div className="space-y-6">
        <div className="space-y-4 py-4">
            <div className="space-y-2">
                <Label
                    htmlFor="code-input"
                    className="text-sm font-semibold uppercase tracking-wider text-muted-foreground"
                >
                    Enter 8-digit code
                </Label>
                <div className="relative">
                    <Input
                        id="code-input"
                        placeholder="e.g. A1B2C3D4"
                        value={inputCode}
                        onChange={(e) =>
                            onInputChange(e.target.value.toUpperCase())
                        }
                        maxLength={8}
                        className="sm:text-3xl md:text-3xl h-16 text-3xl font-bold text-center tracking-[0.5em] rounded-2xl border-2 focus:border-primary uppercase placeholder:tracking-normal placeholder:text-lg"
                        disabled={isConnecting}
                    />
                </div>
            </div>
            <Button
                className="w-full h-14 text-xl rounded-2xl shadow-xl shadow-primary/10 group overflow-hidden"
                disabled={inputCode.length !== 8 || isConnecting}
                onClick={onJoin}
            >
                <span className="flex items-center gap-2 group-hover:gap-4 transition-all duration-300">
                    {isConnecting ? 'Connecting...' : 'Join Session'}
                    {!isConnecting && <ArrowRightIcon className="w-5 h-5" />}
                    {isConnecting && (
                        <RefreshCwIcon className="w-5 h-5 animate-spin" />
                    )}
                </span>
            </Button>
            <p className="text-xs text-center text-muted-foreground italic">
                The code is provided by the sender.
            </p>
        </div>
        {isConnecting && (
            <div className="flex justify-center pt-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onCancel}
                    className="text-muted-foreground"
                >
                    Cancel
                </Button>
            </div>
        )}
    </div>
);
