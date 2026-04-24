import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'flagcdn.com',
                port: '',
                pathname: '/**',
            },
        ],
        minimumCacheTTL: 60,
        formats: ['image/avif', 'image/webp'],
    },
    // Performance optimizations
    experimental: {
        optimizePackageImports: [
            'lucide-react',
            'framer-motion',
            'radix-ui',
            'sonner',
            'clsx',
            'tailwind-merge',
            'i18next',
            'react-i18next',
        ],
    },
    typedRoutes: true,
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },
    typescript: {
        ignoreBuildErrors: false,
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://flagcdn.com; font-src 'self' data:; connect-src 'self' https://ntfy.sh; frame-ancestors 'none'; upgrade-insecure-requests;",
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()',
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=31536000; includeSubDomains; preload',
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
