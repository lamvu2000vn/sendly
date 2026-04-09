'use client';

import { useAppStore } from '@/store/useAppStore';
import { useWebRTC } from '@/hooks/useWebRTC';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import {
    CopyIcon,
    DownloadIcon,
    FileIcon,
    UploadIcon,
    XCircle,
    ZapIcon,
    ArrowRightIcon,
    RefreshCwIcon,
} from 'lucide-react';
import { useState, useRef } from 'react';
import { toast } from 'sonner';

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
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isConnected = connectionStatus === 'connected';
    const isConnecting = connectionStatus === 'connecting';

    const handleCopy = () => {
        if (connectionCode) {
            navigator.clipboard.writeText(connectionCode);
            toast.success('Code copied to clipboard');
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            sendFile(e.target.files[0]);
        }
    };

    return (
        <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-background via-muted/30 to-background">
            <div className="w-full max-w-xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary shadow-lg shadow-primary/20 rotate-3 transform hover:rotate-0 transition-transform duration-300">
                        <UploadIcon className="w-10 h-10 text-primary-foreground" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-5xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                            Sendly
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Direct, private, and fast. No middleman.
                        </p>
                    </div>
                </div>

                <Card className="glass-card shadow-2xl border-primary/10 overflow-hidden backdrop-blur-sm bg-white/50 dark:bg-black/50">
                    <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                    <CardHeader className="pb-4">
                        <CardTitle className="flex justify-between items-center text-xl">
                            <span>Connection</span>
                            <div className="flex items-center gap-2">
                                <div
                                    className={`w-2 h-2 rounded-full animate-pulse ${connectionStatus === 'connected'
                                        ? 'bg-green-500'
                                        : connectionStatus === 'connecting'
                                            ? 'bg-yellow-500'
                                            : connectionStatus === 'error'
                                                ? 'bg-red-500'
                                                : 'bg-gray-400'
                                        }`}
                                />
                                <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
                                    {connectionStatus}
                                </span>
                            </div>
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        {isConnected ? (
                            <div className="space-y-6 py-4 animate-in zoom-in-95 duration-500">
                                <div
                                    className="group relative border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 p-10 rounded-2xl text-center transition-all duration-300 cursor-pointer"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                >
                                    <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                        <FileIcon className="w-10 h-10 text-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-semibold">
                                            Drop or Select File
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Unlimited file size, direct to peer.
                                        </p>
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                    />
                                </div>

                                {transferState && (
                                    <div className="bg-muted/40 p-5 rounded-xl border border-border space-y-4 animate-in slide-in-from-top-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-bold truncate max-w-[250px]">
                                                {transferState.fileName}
                                            </span>
                                            <span className="text-muted-foreground font-medium">
                                                {(
                                                    transferState.fileSize /
                                                    1024 /
                                                    1024
                                                ).toFixed(2)}{' '}
                                                MB
                                            </span>
                                        </div>
                                        <div className="relative pt-1">
                                            <Progress
                                                value={transferState.progress}
                                                className="h-3 shadow-inner"
                                            />
                                        </div>
                                        <div className="flex justify-between text-sm items-center">
                                            <span className="text-primary font-semibold flex items-center gap-2">
                                                <RefreshCwIcon
                                                    className={`w-3 h-3 ${transferState.progress < 100 ? 'animate-spin' : ''}`}
                                                />
                                                {transferState.isReceiving
                                                    ? 'Receiving'
                                                    : 'Sending'}{' '}
                                                —{' '}
                                                {Math.round(
                                                    transferState.progress,
                                                )}
                                                %
                                            </span>
                                            {transferState.objectUrl &&
                                                transferState.progress ===
                                                100 && (
                                                    <Button
                                                        size="sm"
                                                        asChild
                                                        className="rounded-full shadow-lg hover:shadow-primary/20 transition-all"
                                                    >
                                                        <a
                                                            href={
                                                                transferState.objectUrl
                                                            }
                                                            download={
                                                                transferState.fileName
                                                            }
                                                        >
                                                            <DownloadIcon className="w-4 h-4 mr-2" />
                                                            Save File
                                                        </a>
                                                    </Button>
                                                )}
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-center pt-2">
                                    <Button
                                        variant="ghost"
                                        className="text-destructive hover:bg-destructive/10 rounded-full px-6"
                                        onClick={disconnect}
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        End Session
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Tabs
                                defaultValue="sender"
                                className="space-y-6"
                                onValueChange={(v) => {
                                    setMode(v as 'sender' | 'receiver');
                                    setInputCode('');
                                }}
                            >
                                <TabsList className="w-full p-1 bg-muted/50 rounded-xl border border-border">
                                    <TabsTrigger
                                        value="sender"
                                        className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm"
                                    >
                                        Send
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="receiver"
                                        className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm"
                                    >
                                        Receive
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent
                                    value="sender"
                                    className="space-y-8 animate-in slide-in-from-left-4 duration-500"
                                >
                                    {!connectionCode && !isConnecting ? (
                                        <div className="text-center py-8 space-y-6">
                                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                                                <ZapIcon className="w-8 h-8 text-primary" />
                                            </div>
                                            <div className="space-y-4">
                                                <p className="text-muted-foreground text-sm">
                                                    Start a new session to get a
                                                    8-digit connection code.
                                                </p>
                                                <Button
                                                    className="w-full h-12 text-lg rounded-xl shadow-lg shadow-primary/20"
                                                    onClick={startConnection}
                                                >
                                                    Start Sending
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6 py-4">
                                            <div className="text-center space-y-4">
                                                <Label className="text-sm text-muted-foreground uppercase tracking-widest font-bold">
                                                    Your Connection Code
                                                </Label>
                                                <div className="flex items-center justify-center gap-2">
                                                    {connectionCode ? (
                                                        <div className="flex gap-2">
                                                            {connectionCode
                                                                .split('')
                                                                .map(
                                                                    (
                                                                        char,
                                                                        i,
                                                                    ) => (
                                                                        <span
                                                                            key={
                                                                                i
                                                                            }
                                                                            className="w-10 h-14 flex items-center justify-center bg-card border-2 border-primary/20 rounded-xl text-3xl font-black text-primary shadow-sm"
                                                                        >
                                                                            {
                                                                                char
                                                                            }
                                                                        </span>
                                                                    ),
                                                                )}
                                                        </div>
                                                    ) : (
                                                        <div className="h-14 flex items-center justify-center gap-2 italic text-muted-foreground">
                                                            Generating your
                                                            code...
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-center gap-4 pt-4">
                                                {connectionCode && (
                                                    <Button
                                                        variant="outline"
                                                        className="rounded-full px-6"
                                                        onClick={handleCopy}
                                                    >
                                                        <CopyIcon className="w-4 h-4 mr-2" />
                                                        Copy Code
                                                    </Button>
                                                )}
                                                <p className="text-[10px] text-muted-foreground bg-muted p-2 rounded-lg text-center max-w-[200px]">
                                                    {isConnecting
                                                        ? 'Waiting for receiver to join...'
                                                        : 'Share this code with the receiver.'}
                                                </p>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={disconnect}
                                                    className="text-muted-foreground"
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent
                                    value="receiver"
                                    className="space-y-6 animate-in slide-in-from-right-4 duration-500"
                                >
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
                                                        setInputCode(
                                                            e.target.value.toUpperCase(),
                                                        )
                                                    }
                                                    maxLength={8}
                                                    className="h-16 text-3xl font-bold text-center tracking-[0.5em] rounded-2xl border-2 focus:border-primary uppercase placeholder:tracking-normal placeholder:text-lg"
                                                    disabled={isConnecting}
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            className="w-full h-14 text-xl rounded-2xl shadow-xl shadow-primary/10 group overflow-hidden"
                                            disabled={
                                                inputCode.length !== 8 ||
                                                isConnecting
                                            }
                                            onClick={() =>
                                                joinConnection(inputCode)
                                            }
                                        >
                                            <span className="flex items-center gap-2 group-hover:gap-4 transition-all duration-300">
                                                {isConnecting
                                                    ? 'Connecting...'
                                                    : 'Join Session'}
                                                {!isConnecting && (
                                                    <ArrowRightIcon className="w-5 h-5" />
                                                )}
                                                {isConnecting && (
                                                    <RefreshCwIcon className="w-5 h-5 animate-spin" />
                                                )}
                                            </span>
                                        </Button>
                                        <p className="text-xs text-center text-muted-foreground italic">
                                            The code is provided by the sender.
                                        </p>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        )}
                    </CardContent>
                </Card>

                <footer className="text-center text-xs text-muted-foreground opacity-50 space-y-2">
                    <p>© 2026 Sendly — Peer-to-Peer Encryption Enabled</p>
                    <p>Uses ephemeral signaling for private handshake.</p>
                </footer>
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
