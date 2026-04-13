import { LanguageToggle } from '@/components/ui/LanguageToggle';

export const Footer = () => (
    <footer className="flex flex-col items-center text-center text-xs text-muted-foreground opacity-50 space-y-4 pb-8">
        <div className="space-y-2">
            <p>© 2026 Sendly — Peer-to-Peer Encryption Enabled</p>
            <p>Uses ephemeral signaling for private handshake.</p>
        </div>
        <LanguageToggle className="opacity-100" />
    </footer>
);
