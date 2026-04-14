import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConnectionStatusIndicator } from './ConnectionStatusIndicator';
import { ConnectionStatus } from '@/store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';

interface ConnectionCardProps {
    status: ConnectionStatus;
    title: React.ReactNode;
    children: React.ReactNode;
}

export const ConnectionCard = ({
    status,
    title,
    children,
}: ConnectionCardProps) => (
    <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
    >
        <Card className="gap-0 overflow-hidden rounded-2xl border-white/20 py-0 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] sm:rounded-3xl dark:border-white/5 dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]">
            <CardHeader className="rounded-none border-b border-white/10 bg-white/5 px-6 py-5 sm:px-10 sm:py-6 md:px-12 dark:border-white/5">
                <CardTitle className="font-heading flex items-center justify-between text-base tracking-tight sm:text-lg">
                    <div className="flex items-center gap-3">{title}</div>
                    <ConnectionStatusIndicator status={status} />
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-10 md:p-12">
                <AnimatePresence mode="wait">{children}</AnimatePresence>
            </CardContent>
        </Card>
    </motion.div>
);
