'use client';

import { GlassDialog } from '@/components/common/GlassDialog';
import { m } from 'framer-motion';
import { MousePointerClick, Zap, Files, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { memo } from 'react';

type HelpDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

const HelpDialog = memo(({ open, onOpenChange }: HelpDialogProps) => {
    const { t } = useTranslation();

    const steps = [
        {
            icon: <MousePointerClick className="text-primary h-6 w-6" />,
            title: t('guide.step_1_title'),
            description: t('guide.step_1_desc'),
        },
        {
            icon: <Zap className="text-warning h-6 w-6" />,
            title: t('guide.step_2_title'),
            description: t('guide.step_2_desc'),
        },
        {
            icon: <Files className="text-info h-6 w-6" />,
            title: t('guide.step_3_title'),
            description: t('guide.step_3_desc'),
        },
    ];

    const headerContent = (
        <m.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={
                open ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0 }
            }
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-2xl shadow-inner"
        >
            <ShieldCheck className="text-primary h-8 w-8" />
        </m.div>
    );

    return (
        <GlassDialog
            open={open}
            onOpenChange={onOpenChange}
            title={t('guide.title')}
            headerContent={headerContent}
            maxWidth="sm:max-w-lg"
        >
            <m.div
                variants={containerVariants}
                initial="hidden"
                animate={open ? 'visible' : 'hidden'}
                className="space-y-6"
            >
                {steps.map((step, index) => (
                    <m.div
                        key={index}
                        variants={itemVariants}
                        className="flex items-start gap-4"
                    >
                        <div className="bg-muted/50 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                            {step.icon}
                        </div>
                        <div className="space-y-1">
                            <h4 className="leading-none font-bold">
                                {step.title}
                            </h4>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                {step.description}
                            </p>
                        </div>
                    </m.div>
                ))}

                <m.div
                    variants={itemVariants}
                    className="bg-muted/30 mt-6 rounded-2xl p-4 text-xs italic"
                >
                    <p className="text-muted-foreground">
                        {t('guide.p2p_note')}
                    </p>
                </m.div>
            </m.div>
        </GlassDialog>
    );
});

HelpDialog.displayName = 'HelpDialog';

export default HelpDialog;
