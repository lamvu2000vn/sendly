import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ConnectionStatus =
    | 'disconnected'
    | 'connecting'
    | 'connected'
    | 'error';

export type Theme = 'light' | 'dark' | 'system';

interface AppState {
    mode: 'host' | 'guest' | null;
    setMode: (mode: 'host' | 'guest' | null) => void;
    connectionStatus: ConnectionStatus;
    setConnectionStatus: (status: ConnectionStatus) => void;
    connectionCode: string;
    setConnectionCode: (code: string) => void;
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            mode: null,
            setMode: (mode) => set({ mode }),
            connectionStatus: 'disconnected',
            setConnectionStatus: (status) => set({ connectionStatus: status }),
            connectionCode: '',
            setConnectionCode: (code) => set({ connectionCode: code }),
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
