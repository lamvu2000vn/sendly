import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ConnectionStatus =
    | 'disconnected'
    | 'connecting'
    | 'connected'
    | 'error'
    | 'offline';

export type Theme = 'light' | 'dark' | 'system';

interface AppState {
    mode: 'host' | 'guest' | null;
    setMode: (mode: 'host' | 'guest' | null) => void;
    connectionStatus: ConnectionStatus;
    setConnectionStatus: (status: ConnectionStatus, reason?: string) => void;
    connectionCode: string;
    setConnectionCode: (code: string) => void;
    connectionCodeCreatedAt: number | null;
    isCodeExpired: boolean;
    setCodeExpired: (expired: boolean) => void;
    theme: Theme;
    setTheme: (theme: Theme) => void;
    errorReason: string | null;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            mode: null,
            setMode: (mode) => set({ mode }),
            connectionStatus: 'disconnected',
            errorReason: null,
            setConnectionStatus: (status, reason) =>
                set({ connectionStatus: status, errorReason: reason || null }),
            connectionCode: '',
            setConnectionCode: (code) =>
                set({
                    connectionCode: code,
                    connectionCodeCreatedAt: code ? Date.now() : null,
                    isCodeExpired: false,
                }),
            connectionCodeCreatedAt: null,
            isCodeExpired: false,
            setCodeExpired: (expired) => set({ isCodeExpired: expired }),
            theme: 'system',
            setTheme: (theme) => set({ theme }),
        }),
        {
            name: 'sendly-app-storage',
            partialize: (state) => ({
                mode: state.mode,
                theme: state.theme,
            }),
        },
    ),
);
