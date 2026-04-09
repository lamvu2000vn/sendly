import { create } from 'zustand';

interface AppState {
    mode: 'sender' | 'receiver' | null;
    setMode: (mode: 'sender' | 'receiver' | null) => void;
    connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
    setConnectionStatus: (
        status: 'disconnected' | 'connecting' | 'connected' | 'error',
    ) => void;
    connectionCode: string;
    setConnectionCode: (code: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
    mode: null,
    setMode: (mode) => set({ mode }),
    connectionStatus: 'disconnected',
    setConnectionStatus: (status) => set({ connectionStatus: status }),
    connectionCode: '',
    setConnectionCode: (code) => set({ connectionCode: code }),
}));
