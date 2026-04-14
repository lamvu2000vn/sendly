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
        ],
    },
    typedRoutes: true,
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },
    typescript: {
        ignoreBuildErrors: false,
    },
};

export default nextConfig;
