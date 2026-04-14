import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConnectionStatusIndicator } from './ConnectionStatusIndicator';
import { ConnectionStatus } from '@/store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';

interface ConnectionCardProps {
    status: ConnectionStatus;
    title: string;
    children: React.ReactNode;
}

export const ConnectionCard = ({ status, title, children }: ConnectionCardProps) => (
    <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
    >
        <Card className="shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] border-white/20 dark:border-white/5 overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] gap-0 py-0">
            <CardHeader className="border-b border-white/10 dark:border-white/5 bg-white/5 px-6 sm:px-10 md:px-12 py-5 sm:py-6 rounded-none">
                <CardTitle className="flex justify-between items-center text-base sm:text-lg font-heading tracking-tight">
                    <span className="opacity-70 uppercase text-[10px] sm:text-xs md:text-sm font-black tracking-widest">
                        {title}
                    </span>
                    <ConnectionStatusIndicator status={status} />
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-10 md:p-12">
                <AnimatePresence mode="wait">{children}</AnimatePresence>
            </CardContent>
        </Card>
    </motion.div>
);
