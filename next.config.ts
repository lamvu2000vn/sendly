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
    },
    // Performance optimizations
    experimental: {
        optimizePackageImports: [
            'lucide-react',
            'framer-motion',
            'radix-ui',
            'sonner',
        ],
    },
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },
};

export default nextConfig;
