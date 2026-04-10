import type { Metadata } from 'next';
import { Outfit, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from 'sonner';
import QueryProvider from '@/components/providers/QueryProvider';
import { BackgroundGradient } from '@/components/ui/BackgroundGradient';

const outfit = Outfit({
    subsets: ['latin'],
    variable: '--font-heading',
    display: 'swap',
});

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-sans',
    display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    variable: '--font-mono',
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'Sendly | Futuristic P2P File Transfer',
    description:
        'Fast, secure, and beautiful peer-to-peer file sharing directly in your browser. No servers, no storage, just direct connection.',
    keywords: ['file transfer', 'webrtc', 'p2p', 'secure sharing', 'sendly'],
    authors: [{ name: 'Sendly Team' }],
    viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={cn(
                'h-full',
                'antialiased',
                outfit.variable,
                inter.variable,
                jetbrainsMono.variable,
            )}
            suppressHydrationWarning
        >
            <body className="min-h-full flex flex-col font-sans selection:bg-primary/30 selection:text-primary">
                <BackgroundGradient />
                <QueryProvider>
                    <div className="relative z-10 flex flex-col min-h-screen">
                        {children}
                    </div>
                </QueryProvider>
                <Toaster
                    position="top-center"
                    richColors
                    closeButton
                    theme="system"
                />
            </body>
        </html>
    );
}
