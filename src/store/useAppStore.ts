import { create } from 'zustand';

export type ConnectionStatus =
    | 'disconnected'
    | 'connecting'
    | 'connected'
    | 'error';

interface AppState {
    mode: 'sender' | 'receiver' | null;
    setMode: (mode: 'sender' | 'receiver' | null) => void;
    connectionStatus: ConnectionStatus;
    setConnectionStatus: (status: ConnectionStatus) => void;
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
