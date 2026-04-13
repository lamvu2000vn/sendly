'use client';

import { useAppStore } from '@/store/useAppStore';
import { useWebRTC } from '@/hooks/useWebRTC';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { lazy, useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

import { Hero } from '@/components/pages/home/_components/Hero';
import { Footer } from '@/components/pages/home/_components/Footer';
import { ConnectionCard } from '@/components/pages/home/_components/ConnectionCard';
import { ConnectedView } from '@/components/pages/home/_components/ConnectedView';
import { SenderView } from '@/components/pages/home/_components/SenderView';
import { ReceiverView } from '@/components/pages/home/_components/ReceiverView';

const ConfirmDialog = lazy(() => import('@/components/dialogs/ConfirmDialog'));

export default function HomePageComponent() {
    const { mode, setMode, connectionStatus, connectionCode } = useAppStore();
    const {
        transferState,
        startConnection,
        joinConnection,
        sendFiles,
        clearTransfer,
        deleteFile,
        cancelTransfer,
        disconnect,
    } = useWebRTC();

    const { t } = useTranslation();
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

    useEffect(() => {
        if (mode === null) {
            setInputCode('');
        }
    }, [mode]);

    const isConnected = connectionStatus === 'connected';
    const isConnecting = connectionStatus === 'connecting';

    const handleCopy = () => {
        if (connectionCode) {
            navigator.clipboard.writeText(connectionCode);
            toast.success(t('toast.copy_success'));
        }
    };

    const handleFileSelect = useCallback(
        (files: File[]) => {
            sendFiles(files);
        },
        [sendFiles],
    );

    const handleDisconnect = (stayOnCurrentMode = false) => {
        const files = transferState?.files || [];
        const isTransferring = files.some((f) => f.status === 'transferring');
        const hasSuccessfulFiles = files.some((f) => f.status === 'completed');

        // If no files were successful, always reset the app (go back to tab selection)
        const effectiveStayOnMode = hasSuccessfulFiles
            ? stayOnCurrentMode
            : false;

        const performDisconnect = () => {
            disconnect(effectiveStayOnMode);
        };

        if (isTransferring) {
            setConfirmConfig({
                open: true,
                message: t('dialog.transfer_active'),
                onConfirm: performDisconnect,
            });
            return;
        }
        performDisconnect();
    };

    const hasReceivedFiles =
        transferState &&
        transferState.files.some(
            (f) => f.type === 'received' && f.status === 'completed',
        );

    const showTransferView = isConnected || hasReceivedFiles;

    return (
        <main className="flex flex-col items-center justify-center flex-1 p-4 sm:p-10 md:p-16 relative overflow-hidden">
            <div className="w-full max-w-2xl space-y-8 sm:space-y-12 relative z-20">
                <Hero />

                <ConnectionCard status={connectionStatus}>
                    <AnimatePresence mode="wait">
                        {showTransferView ? (
                            <motion.div
                                key="connected"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.4 }}
                            >
                                <ConnectedView
                                    isConnected={isConnected}
                                    transferState={transferState}
                                    onFileSelect={handleFileSelect}
                                    onDisconnect={() =>
                                        handleDisconnect(isConnected)
                                    }
                                    onClearTransfer={clearTransfer}
                                    onDeleteFile={deleteFile}
                                    onCancel={cancelTransfer}
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
                                        disconnect(true);
                                        setMode(v as 'sender' | 'receiver');
                                        setInputCode('');
                                    }}
                                >
                                    <TabsList
                                        variant="default"
                                        className="w-full mb-10 h-14 sm:h-16 p-1.5 bg-muted/50 rounded-2xl sm:rounded-3xl"
                                    >
                                        <TabsTrigger
                                            value="sender"
                                            className="h-full text-base sm:text-lg font-bold rounded-xl sm:rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all"
                                        >
                                            {t('tabs.send')}
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="receiver"
                                            className="h-full text-base sm:text-lg font-bold rounded-xl sm:rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all"
                                        >
                                            {t('tabs.receive')}
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent
                                        value="sender"
                                        className="mt-0 outline-none"
                                    >
                                        <SenderView
                                            connectionCode={connectionCode}
                                            isConnecting={isConnecting}
                                            onStart={startConnection}
                                            onCopy={handleCopy}
                                            onCancel={() => handleDisconnect()}
                                        />
                                    </TabsContent>

                                    <TabsContent
                                        value="receiver"
                                        className="mt-0 outline-none"
                                    >
                                        <ReceiverView
                                            inputCode={inputCode}
                                            isConnecting={isConnecting}
                                            onInputChange={setInputCode}
                                            onJoin={() =>
                                                joinConnection(inputCode)
                                            }
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

            <ConfirmDialog
                open={confirmConfig.open}
                title={t('dialog.terminate_title')}
                message={confirmConfig.message}
                confirmText={t('dialog.confirm')}
                cancelText={t('dialog.abort')}
                onConfirm={confirmConfig.onConfirm}
                onOpenChange={(open) =>
                    setConfirmConfig((prev) => ({ ...prev, open }))
                }
            />
        </main>
    );
}
