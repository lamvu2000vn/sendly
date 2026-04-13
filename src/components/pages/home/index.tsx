'use client';

import { useAppStore } from '@/store/useAppStore';
import { useWebRTC } from '@/hooks/useWebRTC';

import { lazy, useState, useCallback, useEffect, Suspense } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ZapIcon } from 'lucide-react';

import { Hero } from '@/components/pages/home/_components/Hero';
import { Footer } from '@/components/pages/home/_components/Footer';
import { ConnectionCard } from '@/components/pages/home/_components/ConnectionCard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const ConfirmDialog = lazy(() => import('@/components/dialogs/ConfirmDialog'));

const HostView = lazy(() =>
    import('@/components/pages/home/_components/HostView').then((m) => ({
        default: m.HostView,
    })),
);

const GuestView = lazy(() =>
    import('@/components/pages/home/_components/GuestView').then((m) => ({
        default: m.GuestView,
    })),
);

const ConnectedView = lazy(() =>
    import('@/components/pages/home/_components/ConnectedView').then((m) => ({
        default: m.ConnectedView,
    })),
);

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
        if (mode !== 'host' && mode !== 'guest') {
            if (mode !== null) setMode(null);
            setInputCode('');
        }
    }, [mode, setMode]);

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
        <main className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-10 md:p-16 relative overflow-y-auto scrollbar-hide">
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
                                <Suspense
                                    fallback={
                                        <div className="h-64 flex items-center justify-center">
                                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    }
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
                                </Suspense>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="mode-selection"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-6"
                            >
                                {!mode ||
                                (mode !== 'host' && mode !== 'guest') ? (
                                    <motion.div
                                        variants={{
                                            hidden: { opacity: 0 },
                                            visible: {
                                                opacity: 1,
                                                transition: {
                                                    staggerChildren: 0.15,
                                                },
                                            },
                                        }}
                                        initial="hidden"
                                        animate="visible"
                                        className="text-center space-y-8 py-4"
                                    >
                                        <motion.div
                                            variants={{
                                                hidden: {
                                                    scale: 0.8,
                                                    opacity: 0,
                                                },
                                                visible: {
                                                    scale: 1,
                                                    opacity: 1,
                                                },
                                            }}
                                            className="relative w-20 h-20 mx-auto"
                                        >
                                            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                                            <div className="relative z-10 w-full h-full bg-primary/10 rounded-full flex items-center justify-center">
                                                <ZapIcon className="w-10 h-10 text-primary" />
                                            </div>
                                        </motion.div>

                                        <motion.div
                                            variants={{
                                                hidden: { opacity: 0 },
                                                visible: {
                                                    opacity: 1,
                                                    transition: {
                                                        staggerChildren: 0.1,
                                                    },
                                                },
                                            }}
                                            className="space-y-6"
                                        >
                                            <motion.div
                                                variants={{
                                                    hidden: {
                                                        y: 10,
                                                        opacity: 0,
                                                    },
                                                    visible: {
                                                        y: 0,
                                                        opacity: 1,
                                                    },
                                                }}
                                                className="space-y-2"
                                            >
                                                <h3 className="text-xl font-bold font-heading">
                                                    {t('sender.ready_title')}
                                                </h3>
                                                <p className="text-muted-foreground text-sm max-w-[240px] mx-auto leading-relaxed">
                                                    {t('sender.ready_desc')}
                                                </p>
                                            </motion.div>

                                            <motion.div
                                                variants={{
                                                    hidden: { opacity: 0 },
                                                    visible: {
                                                        opacity: 1,
                                                        transition: {
                                                            staggerChildren: 0.1,
                                                        },
                                                    },
                                                }}
                                                className="space-y-6"
                                            >
                                                <motion.div
                                                    variants={{
                                                        hidden: {
                                                            y: 10,
                                                            opacity: 0,
                                                        },
                                                        visible: {
                                                            y: 0,
                                                            opacity: 1,
                                                        },
                                                    }}
                                                >
                                                    <Button
                                                        className="w-full h-16 sm:h-20 text-lg sm:text-xl font-bold rounded-2xl glow-primary shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                                        onClick={() => {
                                                            setMode('host');
                                                            startConnection();
                                                        }}
                                                    >
                                                        {t(
                                                            'sender.generate_btn',
                                                        )}
                                                    </Button>
                                                </motion.div>

                                                <motion.div
                                                    variants={{
                                                        hidden: { opacity: 0 },
                                                        visible: { opacity: 1 },
                                                    }}
                                                    className="relative"
                                                >
                                                    <div className="absolute inset-0 flex items-center">
                                                        <Separator />
                                                    </div>
                                                    <div className="relative flex justify-center text-xs uppercase">
                                                        <span className="bg-background/40 backdrop-blur-xl px-5 py-1.5 rounded-full border border-white/20 dark:border-white/5 text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                                                            or
                                                        </span>
                                                    </div>
                                                </motion.div>

                                                <motion.div
                                                    variants={{
                                                        hidden: {
                                                            y: 10,
                                                            opacity: 0,
                                                        },
                                                        visible: {
                                                            y: 0,
                                                            opacity: 1,
                                                        },
                                                    }}
                                                >
                                                    <Button
                                                        variant="secondary"
                                                        className="w-full h-12 sm:h-14 text-base font-bold rounded-2xl shadow-lg border border-white/5 hover:bg-white/10 transition-all"
                                                        onClick={() =>
                                                            setMode('guest')
                                                        }
                                                    >
                                                        Enter code
                                                    </Button>
                                                </motion.div>
                                            </motion.div>
                                        </motion.div>
                                    </motion.div>
                                ) : (
                                    <Suspense
                                        fallback={
                                            <div className="h-64 flex items-center justify-center">
                                                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                            </div>
                                        }
                                    >
                                        {mode === 'host' ? (
                                            <div className="mt-4">
                                                <HostView
                                                    connectionCode={
                                                        connectionCode
                                                    }
                                                    isConnecting={isConnecting}
                                                    onStart={startConnection}
                                                    onCopy={handleCopy}
                                                    onBack={() => {
                                                        handleDisconnect();
                                                        setMode(null);
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <div className="mt-4">
                                                <GuestView
                                                    inputCode={inputCode}
                                                    isConnecting={isConnecting}
                                                    onInputChange={setInputCode}
                                                    onJoin={() =>
                                                        joinConnection(
                                                            inputCode,
                                                        )
                                                    }
                                                    onBack={() => {
                                                        handleDisconnect();
                                                        setMode(null);
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </Suspense>
                                )}
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
