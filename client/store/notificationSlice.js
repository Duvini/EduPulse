/**
 * Zustand slice for managing notification state
 */
export const createNotificationSlice = (set) => ({
    notifications: [],
    unreadNotificationCount: 0,
    isNotificationsOpen: false,
    isLoading: false,
    lastPolledTimestamp: Date.now(),

    // Actions
    setNotifications: (notifications) => set({ 
        notifications,
        // Also update unread count
        unreadNotificationCount: notifications.filter(n => !n.read).length
    }),

    addNotification: (notification) => set((state) => {
        // Check if notification already exists
        const exists = state.notifications.some(n => n.id === notification.id);
        
        if (exists) {
            return state; // Don't add duplicate notification
        }
        
        return {
            notifications: [notification, ...state.notifications],
            unreadNotificationCount: state.unreadNotificationCount + (notification.read ? 0 : 1)
        };
    }),
    
    // Add multiple notifications at once (useful for polling results)
    addNotifications: (newNotifications) => set((state) => {
        if (!newNotifications || newNotifications.length === 0) {
            return state;
        }
        
        // Merge new notifications with existing ones (avoiding duplicates)
        const mergedNotifications = [...state.notifications];
        let newUnreadCount = 0;
        
        newNotifications.forEach(notification => {
            const exists = mergedNotifications.some(n => n.id === notification.id);
            if (!exists) {
                mergedNotifications.unshift(notification); // Add at beginning
                if (!notification.read) {
                    newUnreadCount++;
                }
            }
        });
        
        // Sort by date (newest first)
        mergedNotifications.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        return {
            notifications: mergedNotifications,
            unreadNotificationCount: state.unreadNotificationCount + newUnreadCount,
            lastPolledTimestamp: Date.now()
        };
    }),

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
    
    setLastPolledTimestamp: (timestamp) => set({ lastPolledTimestamp: timestamp }),

    toggleNotificationsDropdown: () => set((state) => ({
        isNotificationsOpen: !state.isNotificationsOpen
    })),

    closeNotificationsDropdown: () => set({
        isNotificationsOpen: false
    }),
    
    setLoading: (isLoading) => set({ isLoading })
});