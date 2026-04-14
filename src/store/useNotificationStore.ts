import { create } from 'zustand';
import { nanoid } from 'nanoid';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    duration?: number;
    icon?: React.ReactNode;
}

interface NotificationStore {
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id'>) => string;
    removeNotification: (id: string) => void;
    dismissAll: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
    notifications: [],
    addNotification: (notification) => {
        const id = nanoid();
        set((state) => ({
            notifications: [
                { ...notification, id },
                ...state.notifications,
            ].slice(0, 5),
        }));
        return id;
    },
    removeNotification: (id) =>
        set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
        })),
    dismissAll: () => set({ notifications: [] }),
}));

export const toast = {
    success: (message: string) =>
        useNotificationStore
            .getState()
            .addNotification({ type: 'success', message }),
    error: (message: string) =>
        useNotificationStore
            .getState()
            .addNotification({ type: 'error', message }),
    info: (message: string) =>
        useNotificationStore
            .getState()
            .addNotification({ type: 'info', message }),
    warning: (message: string) =>
        useNotificationStore
            .getState()
            .addNotification({ type: 'warning', message }),
};
