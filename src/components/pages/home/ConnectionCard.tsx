import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConnectionStatusIndicator } from './ConnectionStatusIndicator';
import { ConnectionStatus } from '@/store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';

interface ConnectionCardProps {
    status: ConnectionStatus;
    children: React.ReactNode;
}

export const ConnectionCard = ({ status, children }: ConnectionCardProps) => (
    <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
    >
        <Card className="glass shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] border-white/20 dark:border-white/5 overflow-hidden rounded-3xl">
            <CardHeader className="pb-2 border-b border-white/10 dark:border-white/5 bg-white/5">
                <CardTitle className="flex justify-between items-center text-lg font-heading tracking-tight">
                    <span className="opacity-70 uppercase text-xs font-bold tracking-[0.2em]">
                        Session Link
                    </span>
                    <ConnectionStatusIndicator status={status} />
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <AnimatePresence mode="wait">{children}</AnimatePresence>
            </CardContent>
        </Card>
    </motion.div>
);
