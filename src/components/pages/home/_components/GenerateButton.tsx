import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

const GenerateButton = forwardRef<
    HTMLButtonElement,
    React.ComponentProps<typeof Button>
>(({ className, onClick }, ref) => {
    const { t } = useTranslation('common');

    return (
        <Button
            ref={ref}
            className={cn(
                'glow-primary shadow-primary/20 h-16 w-full rounded-full text-lg font-bold shadow-xl transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] sm:h-20 sm:text-xl',
                className,
            )}
            onClick={onClick}
        >
            {t('sender.generate_btn')}
        </Button>
    );
});

GenerateButton.displayName = 'GenerateButton';

export default GenerateButton;
