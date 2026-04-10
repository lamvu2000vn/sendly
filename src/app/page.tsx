'use client';

import { useAppStore } from '@/store/useAppStore';
import { useWebRTC } from '@/hooks/useWebRTC';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

import { Hero } from '@/components/pages/home/Hero';
import { Footer } from '@/components/pages/home/Footer';
import { ConnectionCard } from '@/components/pages/home/ConnectionCard';
import { ConnectedView } from '@/components/pages/home/ConnectedView';
import { SenderView } from '@/components/pages/home/SenderView';
import { ReceiverView } from '@/components/pages/home/ReceiverView';

export default function Home() {
    const { mode, setMode, connectionStatus, connectionCode } = useAppStore();
    const {
        transferState,
        startConnection,
        joinConnection,
        sendFiles,
        clearTransfer,
        deleteFile,
        disconnect,
    } = useWebRTC();

    const [inputCode, setInputCode] = useState('');
    const [confirmConfig, setConfirmConfig] = useState<{
        open: boolean;
        message: string;
        onConfirm: () => void;
    }>({
        open: false,
        message: '',
        onConfirm: () => {},
    });

    const isConnected = connectionStatus === 'connected';
    const isConnecting = connectionStatus === 'connecting';

    const handleCopy = () => {
        if (connectionCode) {
            navigator.clipboard.writeText(connectionCode);
            toast.success('Access Key copied to clipboard');
        }
    };

    const handleFileSelect = (files: File[]) => {
        sendFiles(files);
    };

    const handleDisconnect = (stayOnCurrentMode = false) => {
        const isTransferring =
            mode === 'sender' &&
            transferState &&
            !transferState.isReceiving &&
            transferState.files.some((f) => f.progress > 0 && f.progress < 100);

        if (isTransferring) {
            setConfirmConfig({
                open: true,
                message:
                    'Active transfers in progress. Severing connection will abort all ongoing data streams. Proceed?',
                onConfirm: () => disconnect(stayOnCurrentMode),
            });
            return;
        }
        disconnect(stayOnCurrentMode);
    };

    return (
        <main className="flex flex-col items-center justify-center flex-1 p-6 relative overflow-hidden">
            <div className="w-full max-w-xl space-y-12 relative z-20">
                <Hero />

                <ConnectionCard status={connectionStatus}>
                    <AnimatePresence mode="wait">
                        {isConnected ? (
                            <motion.div
                                key="connected"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.4 }}
                            >
                                <ConnectedView
                                    transferState={transferState}
                                    onFileSelect={handleFileSelect}
                                    onDisconnect={() => handleDisconnect()}
                                    onClearTransfer={clearTransfer}
                                    onDeleteFile={deleteFile}
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="entry"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-6"
                            >
                                <Tabs
                                    value={mode || 'sender'}
                                    className="w-full"
                                    onValueChange={(v) => {
                                        const isTransferring =
                                            mode === 'sender' &&
                                            transferState &&
                                            !transferState.isReceiving &&
                                            transferState.files.some(f => f.progress > 0 && f.progress < 100);
                                        
                                        if (isTransferring) {
                                            setConfirmConfig({
                                                open: true,
                                                message:
                                                    'Switching modes will terminate current transfers. Continue?',
                                                onConfirm: () => {
                                                    disconnect(true);
                                                    setMode(v as 'sender' | 'receiver');
                                                    setInputCode('');
                                                },
                                            });
                                            return;
                                        }
                                        disconnect(true);
                                        setMode(v as 'sender' | 'receiver');
                                        setInputCode('');
                                    }}
                                >
                                    <TabsList className="grid grid-cols-2 h-14 p-1 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 mb-8">
                                        <TabsTrigger 
                                            value="sender" 
                                            className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all font-bold uppercase tracking-widest text-[10px]"
                                        >
                                            Originate
                                        </TabsTrigger>
                                        <TabsTrigger 
                                            value="receiver"
                                            className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all font-bold uppercase tracking-widest text-[10px]"
                                        >
                                            Receive
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="sender" className="mt-0 outline-none">
                                        <SenderView
                                            connectionCode={connectionCode}
                                            isConnecting={isConnecting}
                                            onStart={startConnection}
                                            onCopy={handleCopy}
                                            onCancel={() => handleDisconnect()}
                                        />
                                    </TabsContent>

                                    <TabsContent value="receiver" className="mt-0 outline-none">
                                        <ReceiverView
                                            inputCode={inputCode}
                                            isConnecting={isConnecting}
                                            onInputChange={setInputCode}
                                            onJoin={() => joinConnection(inputCode)}
                                            onCancel={() => handleDisconnect()}
                                        />
                                    </TabsContent>
                                </Tabs>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </ConnectionCard>

                <Footer />
            </div>

            <Dialog
                open={confirmConfig.open}
                onOpenChange={(open) =>
                    setConfirmConfig((prev) => ({ ...prev, open }))
                }
            >
                <DialogContent className="glass border-white/10 rounded-3xl sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-heading">Terminate Connection?</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            {confirmConfig.message}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="ghost"
                            className="rounded-xl font-bold"
                            onClick={() =>
                                setConfirmConfig((prev) => ({
                                    ...prev,
                                    open: false,
                                }))
                            }
                        >
                            Abort
                        </Button>
                        <Button
                            variant="destructive"
                            className="rounded-xl font-bold glow-destructive shadow-lg"
                            onClick={() => {
                                confirmConfig.onConfirm();
                                setConfirmConfig((prev) => ({
                                    ...prev,
                                    open: false,
                                }));
                            }}
                        >
                            Confirm Termination
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    );
}
