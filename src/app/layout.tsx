import type { Metadata, Viewport } from 'next';
import { Outfit, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import QueryProvider from '@/components/providers/QueryProvider';
import I18nProvider from '@/components/providers/I18nProvider';

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
    title: {
        default: 'Sendly | Futuristic P2P File Transfer',
        template: '%s | Sendly',
    },
    description:
        'Fast, secure, and beautiful peer-to-peer file sharing directly in your browser. No servers, no storage, just direct connection.',
    keywords: [
        'file transfer',
        'webrtc',
        'p2p',
        'secure sharing',
        'sendly',
        'fast transfer',
        'private sharing',
    ],
    authors: [{ name: 'Sendly Team' }],
    creator: 'Sendly Team',
    publisher: 'Sendly',
    robots: {
        index: true,
        follow: true,
    },
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://sendly.app',
        siteName: 'Sendly',
        title: 'Sendly | Futuristic P2P File Transfer',
        description:
            'Fast, secure, and beautiful peer-to-peer file sharing directly in your browser.',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Sendly - Secure P2P File Transfer',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Sendly | Futuristic P2P File Transfer',
        description:
            'Fast, secure, and beautiful peer-to-peer file sharing directly in your browser.',
        images: ['/og-image.png'],
    },
};

export const viewport: Viewport = {
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#fdfafe' },
        { media: '(prefers-color-scheme: dark)', color: '#15191e' },
    ],
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
};

import ThemeProvider from '@/components/providers/ThemeProvider';
import { Suspense } from 'react';
import { lazyNamed } from '@/utils/lazy-named';

const NetworkMonitor = lazyNamed(
    () => import('@/components/common/NetworkMonitor'),
    'NetworkMonitor',
);

const NotificationProvider = lazyNamed(
    () => import('@/components/ui/NotificationProvider'),
    'NotificationProvider',
);

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
            <body
                className="selection:bg-primary/30 selection:text-primary flex min-h-full flex-col font-sans"
                suppressHydrationWarning
            >
                <QueryProvider>
                    <ThemeProvider>
                        <I18nProvider>
                            <Suspense fallback={null}>
                                <NetworkMonitor />
                                <NotificationProvider />
                            </Suspense>

                            <a
                                href="#main-content"
                                className="bg-primary text-primary-foreground absolute top-4 left-4 z-[100] -translate-y-20 rounded-lg px-4 py-2 transition-transform focus:translate-y-0"
                            >
                                Skip to content
                            </a>
                            <div
                                id="main-content"
                                className="relative z-10 flex min-h-screen flex-col"
                            >
                                {children}
                            </div>
                        </I18nProvider>
                    </ThemeProvider>
                </QueryProvider>
            </body>
        </html>
    );
}
