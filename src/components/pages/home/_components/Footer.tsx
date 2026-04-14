import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export const Footer = () => (
    <footer className="text-muted-foreground flex flex-col items-center space-y-6 pb-8 text-center text-xs opacity-100">
        <div className="space-y-2">
            <p>© 2026 Sendly — Peer-to-Peer Encryption Enabled</p>
            <p>Uses ephemeral signaling for private handshake.</p>
        </div>
        <div className="flex items-center gap-4">
            <LanguageToggle className="opacity-100" />
            <ThemeToggle className="opacity-100" />
        </div>
    </footer>
);
