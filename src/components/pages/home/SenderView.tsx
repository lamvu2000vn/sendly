'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CopyIcon, ZapIcon, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

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
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 space-y-8"
            >
                <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                    <div className="relative z-10 w-full h-full bg-primary/10 rounded-full flex items-center justify-center">
                        <ZapIcon className="w-10 h-10 text-primary" />
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold font-heading">
                            Ready to Send?
                        </h3>
                        <p className="text-muted-foreground text-sm max-w-[240px] mx-auto leading-relaxed">
                            Generate a secure, single-use link for instant P2P
                            transfer.
                        </p>
                    </div>
                    <Button
                        className="w-full h-14 text-lg font-bold rounded-2xl glow-primary shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        onClick={onStart}
                    >
                        Initialize Link
                    </Button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-10 py-2"
        >
            <div className="text-center space-y-6">
                <Label className="text-xs text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">
                    Active Channel Code
                </Label>
                <div className="flex items-center justify-center gap-3">
                    {connectionCode ? (
                        <div className="flex gap-2">
                            {connectionCode.split('').map((char, i) => (
                                <motion.span
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{
                                        delay: i * 0.05,
                                        type: 'spring',
                                    }}
                                    key={i}
                                    className="size-12 sm:size-14 flex items-center justify-center bg-white/5 border border-white/20 rounded-2xl text-3xl font-black text-primary shadow-lg backdrop-blur-md"
                                >
                                    {char}
                                </motion.span>
                            ))}
                        </div>
                    ) : (
                        <div className="h-14 flex items-center justify-center gap-3 text-primary/70 font-medium">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span className="animate-pulse">
                                Building secure tunnel...
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col items-center gap-6">
                {connectionCode && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Button
                            variant="secondary"
                            className="rounded-2xl px-8 h-12 font-bold shadow-lg border border-white/5 hover:bg-white/10"
                            onClick={onCopy}
                        >
                            <CopyIcon className="w-4 h-4 mr-3" />
                            Copy Access Key
                        </Button>
                    </motion.div>
                )}

                <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 max-w-[280px] text-center">
                    <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                        {isConnecting
                            ? 'Receiver is connecting. Maintain this window open for the duration of the transfer.'
                            : 'Waiting for a partner to enter the access key.'}
                    </p>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onCancel}
                    className="text-muted-foreground hover:text-destructive transition-colors mt-2"
                >
                    Terminate Session
                </Button>
            </div>
        </motion.div>
    );
};
