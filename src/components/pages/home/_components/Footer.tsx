import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export const Footer = memo(() => {
    const { t } = useTranslation();

    return (
        <footer className="text-muted-foreground flex flex-col items-center space-y-6 pb-8 text-center text-xs opacity-100">
            <div className="space-y-2">
                <p>{t('footer.copyright')}</p>
                <p>{t('footer.description')}</p>
            </div>
            <div className="flex items-center gap-4">
                <LanguageToggle />
                <ThemeToggle />
            </div>
        </footer>
    );
});

Footer.displayName = 'Footer';
