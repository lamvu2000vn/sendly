'use client';

import { useAppStore } from '@/store/useAppStore';
import { useWebRTC } from '@/hooks/useWebRTC';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import {
    CopyIcon,
    DownloadIcon,
    FileIcon,
    UploadIcon,
    XCircle,
} from 'lucide-react';
import { useState, useRef } from 'react';

export default function Home() {
    const { mode, setMode, connectionStatus } = useAppStore();
    const {
        localToken,
        transferState,
        createOffer,
        handleOfferOrAnswer,
        sendFile,
        disconnect,
    } = useWebRTC();

    const [remoteToken, setRemoteToken] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isConnected = connectionStatus === 'connected';

    const handleCopy = () => {
        navigator.clipboard.writeText(localToken);
        alert('Copied to clipboard');
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            sendFile(e.target.files[0]);
        }
    };

    return (
        <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-muted/20">
            <div className="w-full max-w-2xl space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight text-primary flex items-center justify-center gap-2">
                        <UploadIcon className="w-8 h-8" />
                        Sendly
                    </h1>
                    <p className="text-muted-foreground">
                        Peer-to-peer file transfer without limits.
                    </p>
                </div>

                <Card className="shadow-lg border-primary/20">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span>Connection details</span>
                            <span
                                className={`text-xs px-2 py-1 rounded-full ${connectionStatus === 'connected'
                                        ? 'bg-green-100 text-green-700'
                                        : connectionStatus === 'error'
                                            ? 'bg-red-100 text-red-700'
                                            : connectionStatus === 'connecting'
                                                ? 'bg-yellow-100 text-yellow-700'
                                                : 'bg-gray-100 text-gray-700'
                                    }`}
                            >
                                {connectionStatus.charAt(0).toUpperCase() +
                                    connectionStatus.slice(1)}
                            </span>
                        </CardTitle>
                        <CardDescription>
                            Connect your devices directly. No files are stored
                            on any server.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isConnected ? (
                            <div className="space-y-6">
                                <div className="border border-dashed border-primary/50 bg-primary/5 p-8 rounded-xl text-center space-y-4">
                                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                                        <FileIcon className="w-8 h-8 text-primary" />
                                    </div>
                                    <div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            ref={fileInputRef}
                                            onChange={handleFileSelect}
                                        />
                                        <Button
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                            disabled={
                                                transferState !== null &&
                                                transferState.progress < 100
                                            }
                                        >
                                            Select File to Send
                                        </Button>
                                    </div>
                                </div>

                                {transferState && (
                                    <div className="bg-muted p-4 rounded-lg space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium truncate max-w-[200px]">
                                                {transferState.fileName}
                                            </span>
                                            <span className="text-muted-foreground">
                                                {(
                                                    transferState.fileSize /
                                                    1024 /
                                                    1024
                                                ).toFixed(2)}{' '}
                                                MB
                                            </span>
                                        </div>
                                        <Progress
                                            value={transferState.progress}
                                            className="h-2"
                                        />
                                        <div className="flex justify-between text-sm items-center">
                                            <span className="text-muted-foreground">
                                                {transferState.isReceiving
                                                    ? 'Receiving...'
                                                    : 'Sending...'}{' '}
                                                {Math.round(
                                                    transferState.progress,
                                                )}
                                                %
                                            </span>
                                            {transferState.objectUrl &&
                                                transferState.progress ===
                                                100 && (
                                                    <Button size="sm" asChild>
                                                        <a
                                                            href={
                                                                transferState.objectUrl
                                                            }
                                                            download={
                                                                transferState.fileName
                                                            }
                                                        >
                                                            <DownloadIcon className="w-4 h-4 mr-2" />{' '}
                                                            Download
                                                        </a>
                                                    </Button>
                                                )}
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-center pt-4">
                                    <Button
                                        variant="ghost"
                                        className="text-red-500"
                                        onClick={disconnect}
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />{' '}
                                        Disconnect
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Tabs
                                defaultValue="sender"
                                onValueChange={(v) => {
                                    setMode(v as 'sender' | 'receiver');
                                    setRemoteToken('');
                                }}
                            >
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="sender">
                                        Sender
                                    </TabsTrigger>
                                    <TabsTrigger value="receiver">
                                        Receiver
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent
                                    value="sender"
                                    className="space-y-4 pt-4"
                                >
                                    <div className="space-y-2">
                                        <Button
                                            className="w-full"
                                            onClick={createOffer}
                                            disabled={
                                                connectionStatus ===
                                                'connecting'
                                            }
                                        >
                                            {localToken
                                                ? 'Regenerate Connection Token'
                                                : 'Generate Connection Token'}
                                        </Button>
                                    </div>

                                    {localToken && (
                                        <div className="space-y-2">
                                            <div className="p-3 bg-muted rounded-md relative flex items-center justify-between">
                                                <code className="text-xs truncate w-[85%]">
                                                    {localToken}
                                                </code>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={handleCopy}
                                                >
                                                    <CopyIcon className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Send this token to the receiver.
                                            </p>
                                        </div>
                                    )}

                                    <div className="space-y-2 pt-4">
                                        <Label>
                                            Paste Receiver&apos;s Answer Token
                                        </Label>
                                        <Textarea
                                            placeholder="Paste the receiver's token here"
                                            value={remoteToken}
                                            onChange={(e) =>
                                                setRemoteToken(e.target.value)
                                            }
                                        />
                                        <Button
                                            disabled={!remoteToken}
                                            onClick={() =>
                                                handleOfferOrAnswer(
                                                    remoteToken,
                                                    'sender',
                                                )
                                            }
                                        >
                                            Connect
                                        </Button>
                                    </div>
                                </TabsContent>
                                <TabsContent
                                    value="receiver"
                                    className="space-y-4 pt-4"
                                >
                                    <div className="space-y-2">
                                        <Label>
                                            Paste Sender&apos;s Connection Token
                                        </Label>
                                        <Textarea
                                            placeholder="Paste the token from the sender here"
                                            value={remoteToken}
                                            onChange={(e) =>
                                                setRemoteToken(e.target.value)
                                            }
                                        />
                                        <Button
                                            disabled={
                                                !remoteToken || !!localToken
                                            }
                                            onClick={() =>
                                                handleOfferOrAnswer(
                                                    remoteToken,
                                                    'receiver',
                                                )
                                            }
                                        >
                                            Generate Answer Token
                                        </Button>
                                    </div>

                                    {localToken && (
                                        <div className="space-y-2 pt-4">
                                            <div className="p-3 bg-muted rounded-md relative flex items-center justify-between">
                                                <code className="text-xs truncate w-[85%]">
                                                    {localToken}
                                                </code>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={handleCopy}
                                                >
                                                    <CopyIcon className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Send this answer token back to
                                                the sender.
                                            </p>
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
