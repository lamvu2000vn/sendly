'use client';

import { motion } from 'framer-motion';

export const BackgroundGradient = () => {
    return (
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            <div className="bg-background absolute inset-0" />

            {/* Glowing Blobs */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{
                    opacity: [0.3, 0.5, 0.3],
                    scale: [1, 1.2, 1],
                    x: [0, 50, 0],
                    y: [0, 30, 0],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                className="bg-primary/40 absolute -top-[10%] -left-[10%] h-[50%] w-[50%] rounded-full blur-[120px]"
            />

            <motion.div
                initial={{ opacity: 0 }}
                animate={{
                    opacity: [0.2, 0.4, 0.2],
                    scale: [1.2, 1, 1.2],
                    x: [0, -40, 0],
                    y: [0, 60, 0],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 2,
                }}
                className="bg-accent/40 absolute top-[20%] -right-[10%] h-[40%] w-[40%] rounded-full blur-[100px]"
            />

            <motion.div
                initial={{ opacity: 0 }}
                animate={{
                    opacity: [0.15, 0.3, 0.15],
                    scale: [1, 1.3, 1],
                    x: [0, 30, 0],
                    y: [0, -50, 0],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 5,
                }}
                className="absolute -bottom-[10%] left-[20%] h-[60%] w-[60%] rounded-full bg-yellow-500/40 blur-[130px]"
            />

            {/* Mesh Lines (Subtle) */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.03] transition-opacity duration-500 dark:opacity-[0.05]"
                style={{
                    backgroundImage:
                        'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
                    backgroundSize: '40px 40px',
                }}
            />
        </div>
    );
};
