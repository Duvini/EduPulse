export const createNotificationSlice = (set) => ({
    notifications: [],
    unreadNotificationCount: 0,
    isNotificationsOpen: false,

    // Actions
    setNotifications: (notifications) => set({ notifications }),

    addNotification: (notification) => set((state) => ({
        notifications: [notification, ...state.notifications],
        unreadNotificationCount: state.unreadNotificationCount + (notification.read ? 0 : 1)
    })),

    markNotificationAsRead: (id) => set((state) => {
        const updatedNotifications = state.notifications.map(notification =>
            notification.id === id ? { ...notification, read: true } : notification
        );

        const wasUnread = state.notifications.find(n => n.id === id && !n.read);

        return {
            notifications: updatedNotifications,
            unreadNotificationCount: wasUnread ? Math.max(0, state.unreadNotificationCount - 1) : state.unreadNotificationCount
        };
    }),

    markAllNotificationsAsRead: () => set((state) => ({
        notifications: state.notifications.map(notification => ({ ...notification, read: true })),
        unreadNotificationCount: 0
    })),

    setUnreadCount: (count) => set({ unreadNotificationCount: count }),

    toggleNotificationsDropdown: () => set((state) => ({
        isNotificationsOpen: !state.isNotificationsOpen
    })),

    closeNotificationsDropdown: () => set({
        isNotificationsOpen: false
    }),
});