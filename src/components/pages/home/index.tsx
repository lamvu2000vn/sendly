'use client';

import { useAppStore } from '@/store/useAppStore';
import { useWebRTC } from '@/hooks/useWebRTC';

import { makeAsyncComponent } from '@/utils/async-load';

import { useState, useCallback, useEffect, lazy } from 'react';
import { toast } from '@/store/useNotificationStore';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ModeSelection } from '@/components/pages/home/_components/ModeSelection';
import { Hero } from '@/components/pages/home/_components/Hero';
import { Footer } from '@/components/pages/home/_components/Footer';
import { ConnectionCard } from '@/components/pages/home/_components/ConnectionCard';
import { ErrorView } from '@/components/pages/home/_components/ErrorView';
import DefaultCardSkeleton from '@/components/skeletons/DefaultCardSkeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { lazyNamed } from '@/utils/lazy-named';

const ConfirmDialog = makeAsyncComponent(
    'ConfirmDialog',
    lazy(() => import('@/components/dialogs/ConfirmDialog')),
);

const HostView = makeAsyncComponent(
    'HostView',
    lazyNamed(
        () => import('@/components/pages/home/_components/HostView'),
        'HostView',
    ),
    <DefaultCardSkeleton />,
);

const GuestView = makeAsyncComponent(
    'GuestView',
    lazyNamed(
        () => import('@/components/pages/home/_components/GuestView'),
        'GuestView',
    ),
    <DefaultCardSkeleton />,
);

const ConnectedView = makeAsyncComponent(
    'ConnectedView',
    lazyNamed(
        () => import('@/components/pages/home/_components/ConnectedView'),
        'ConnectedView',
    ),
    <DefaultCardSkeleton />,
);

export default function HomePageComponent() {
    const {
        mode,
        setMode,
        connectionStatus,
        connectionCode,
        errorReason,
        isCodeExpired,
    } = useAppStore();
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
    const isNoMode = !mode || (mode !== 'host' && mode !== 'guest');

    const renderTitle = () => {
        const titleText = showTransferView
            ? t('card.title_connected')
            : isNoMode
              ? t('card.title_select')
              : mode === 'host'
                ? t('card.title_host')
                : t('card.title_guest');

        const showBackButton = !isNoMode && !showTransferView;

        return (
            <>
                {showBackButton && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="cur"
                        onClick={() => {
                            handleDisconnect();
                            setMode(null);
                        }}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                )}

                <span className="text-[10px] font-black tracking-widest uppercase opacity-70 sm:text-xs md:text-sm">
                    {titleText}
                </span>
            </>
        );
    };

    return (
        <main className="scrollbar-hide relative flex min-h-screen flex-col items-center justify-center overflow-y-auto p-4 sm:p-10 md:p-16">
            <div className="relative z-20 w-full max-w-2xl space-y-8 sm:space-y-12">
                <Hero />

                <ConnectionCard status={connectionStatus} title={renderTitle()}>
                    <AnimatePresence mode="wait">
                        {connectionStatus === 'error' ? (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.4 }}
                            >
                                <ErrorView
                                    reason={errorReason}
                                    onBackToHome={() => {
                                        handleDisconnect();
                                        setMode(null);
                                    }}
                                />
                            </motion.div>
                        ) : showTransferView ? (
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
                                key="view-switcher"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-6"
                            >
                                {isNoMode ? (
                                    <ModeSelection
                                        onHost={() => {
                                            setMode('host');
                                            startConnection();
                                        }}
                                        onGuest={() => setMode('guest')}
                                    />
                                ) : mode === 'host' ? (
                                    <div className="mt-4">
                                        <HostView
                                            connectionCode={connectionCode}
                                            isConnecting={isConnecting}
                                            isCodeExpired={isCodeExpired}
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
                                                joinConnection(inputCode)
                                            }
                                            onBack={() => {
                                                handleDisconnect();
                                                setMode(null);
                                            }}
                                        />
                                    </div>
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
