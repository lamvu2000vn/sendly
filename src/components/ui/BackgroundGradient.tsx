'use client';

import { motion } from 'framer-motion';

export const BackgroundGradient = () => {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-background" />

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
                className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px]"
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
                className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-accent/15 blur-[100px]"
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
                className="absolute -bottom-[10%] left-[20%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[130px]"
            />

            {/* Mesh Lines (Subtle) */}
            <div
                className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
                style={{
                    backgroundImage:
                        'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
                    backgroundSize: '40px 40px',
                }}
            />
        </div>
    );
};
