'use client';

import { useAppStore } from '@/store/useAppStore';
import { useWebRTC } from '@/hooks/useWebRTC';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { toast } from 'sonner';
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
            toast.success('Đã sao chép mã code vào bộ nhớ tạm');
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
                    'Một số tệp đang được gửi đi. Ngắt kết nối lúc này sẽ làm hỏng quá trình truyền tải. Bạn vẫn muốn dừng chứ?',
                onConfirm: () => disconnect(stayOnCurrentMode),
            });
            return;
        }
        disconnect(stayOnCurrentMode);
    };

    return (
        <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-linear-to-br from-background via-muted/30 to-background">
            <div className="w-full max-w-xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <Hero />

                <ConnectionCard status={connectionStatus}>
                    {isConnected ? (
                        <ConnectedView
                            transferState={transferState}
                            onFileSelect={handleFileSelect}
                            onDisconnect={() => handleDisconnect()}
                            onClearTransfer={clearTransfer}
                            onDeleteFile={deleteFile}
                        />
                    ) : (
                        <div className="space-y-6">
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
                                                'Quá trình gửi file sẽ bị hủy khi bạn chuyển chế độ. Bạn vẫn muốn tiếp tục chứ?',
                                            onConfirm: () => {
                                                disconnect(true);
                                                setMode(
                                                    v as 'sender' | 'receiver',
                                                );
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
                                <TabsList className="w-full">
                                    <TabsTrigger value="sender">
                                        Send
                                    </TabsTrigger>
                                    <TabsTrigger value="receiver">
                                        Receive
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="sender">
                                    <SenderView
                                        connectionCode={connectionCode}
                                        isConnecting={isConnecting}
                                        onStart={startConnection}
                                        onCopy={handleCopy}
                                        onCancel={() => handleDisconnect()}
                                    />
                                </TabsContent>

                                <TabsContent value="receiver">
                                    <ReceiverView
                                        inputCode={inputCode}
                                        isConnecting={isConnecting}
                                        onInputChange={setInputCode}
                                        onJoin={() => joinConnection(inputCode)}
                                        onCancel={() => handleDisconnect()}
                                    />
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}
                </ConnectionCard>

                <Footer />
            </div>

            <Dialog
                open={confirmConfig.open}
                onOpenChange={(open) =>
                    setConfirmConfig((prev) => ({ ...prev, open }))
                }
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xác nhận ngắt kết nối</DialogTitle>
                        <DialogDescription>
                            {confirmConfig.message}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() =>
                                setConfirmConfig((prev) => ({
                                    ...prev,
                                    open: false,
                                }))
                            }
                        >
                            Quay lại
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                confirmConfig.onConfirm();
                                setConfirmConfig((prev) => ({
                                    ...prev,
                                    open: false,
                                }));
                            }}
                        >
                            Xác nhận dừng
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <style jsx global>{`
                .glass-card {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                }
                .dark .glass-card {
                    background: rgba(15, 15, 20, 0.7);
                }
            `}</style>
        </main>
    );
}
