import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';

type FooterProps = {
    onOpenGuide?: () => void;
};

export const Footer = memo(({ onOpenGuide }: FooterProps) => {
    const { t } = useTranslation();

    return (
        <footer className="text-muted-foreground flex flex-col items-center space-y-6 pb-8 text-center text-xs opacity-100">
            <div className="space-y-2">
                <p>{t('footer.copyright')}</p>
                <p>{t('footer.description')}</p>
            </div>
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-primary/10 hover:text-primary h-8 gap-2 rounded-full px-3 text-[10px] font-bold tracking-wider uppercase transition-all"
                    onClick={onOpenGuide}
                >
                    <HelpCircle className="h-3.5 w-3.5" />
                    {t('guide.trigger')}
                </Button>
                <div className="bg-border h-4 w-px opacity-50" />
                <LanguageToggle />
                <ThemeToggle />
            </div>
        </footer>
    );
});

Footer.displayName = 'Footer';
