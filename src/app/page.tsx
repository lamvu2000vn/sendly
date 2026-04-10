'use client';

import { useAppStore } from '@/store/useAppStore';
import { useWebRTC } from '@/hooks/useWebRTC';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { toast } from 'sonner';

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
        sendFile,
        disconnect,
    } = useWebRTC();

    const [inputCode, setInputCode] = useState('');

    const isConnected = connectionStatus === 'connected';
    const isConnecting = connectionStatus === 'connecting';

    const handleCopy = () => {
        if (connectionCode) {
            navigator.clipboard.writeText(connectionCode);
            toast.success('Đã sao chép mã code vào bộ nhớ tạm');
        }
    };

    const handleFileSelect = (file: File) => {
        sendFile(file);
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
                            onDisconnect={() => disconnect()}
                        />
                    ) : (
                        <Tabs
                            value={mode || 'sender'}
                            className="space-y-6"
                            onValueChange={(v) => {
                                disconnect(true);
                                setMode(v as 'sender' | 'receiver');
                                setInputCode('');
                            }}
                        >
                            <TabsList className="w-full">
                                <TabsTrigger value="sender">Send</TabsTrigger>
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
                                    onCancel={() => disconnect()}
                                />
                            </TabsContent>

                            <TabsContent value="receiver">
                                <ReceiverView
                                    inputCode={inputCode}
                                    isConnecting={isConnecting}
                                    onInputChange={setInputCode}
                                    onJoin={() => joinConnection(inputCode)}
                                    onCancel={() => disconnect()}
                                />
                            </TabsContent>
                        </Tabs>
                    )}
                </ConnectionCard>

                <Footer />
            </div>

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
