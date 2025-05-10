import { notificationService } from '../src/services/notificationService';

export const createNotificationSlice = (set) => ({
    notifications: [],
    unreadNotificationCount: 0,
    isNotificationsOpen: false,
    isLoading: false,
    error: null,

    // Actions
    setNotifications: (notifications) => set({ notifications }),

    addNotification: (notification) => set((state) => ({
        notifications: [notification, ...state.notifications],
        unreadNotificationCount: state.unreadNotificationCount + (notification.read ? 0 : 1)
    })),

    markNotificationAsRead: async (id) => {
        try {
            const result = await notificationService.markAsRead(id);
            
            if (!result.error) {
                set((state) => {
                    const updatedNotifications = state.notifications.map(notification =>
                        notification.id === id ? { ...notification, read: true } : notification
                    );
                    
                    const wasUnread = state.notifications.find(n => n.id === id && !n.read);
                    
                    return {
                        notifications: updatedNotifications,
                        unreadNotificationCount: wasUnread ? Math.max(0, state.unreadNotificationCount - 1) : state.unreadNotificationCount
                    };
                });
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    },

    markAllNotificationsAsRead: async (userId) => {
        if (!userId) return;
        
        try {
            const result = await notificationService.markAllAsRead(userId);
            
            if (!result.error) {
                set((state) => ({
                    notifications: state.notifications.map(notification => ({ ...notification, read: true })),
                    unreadNotificationCount: 0
                }));
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    },

    fetchNotifications: async (userId) => {
        if (!userId) return;
        
        set({ isLoading: true, error: null });
        
        try {
            const result = await notificationService.getNotifications(userId);
            
            if (!result.error) {
                set({ 
                    notifications: result.data,
                    isLoading: false
                });
            } else {
                set({ 
                    error: result.message,
                    isLoading: false
                });
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            set({ 
                error: 'Failed to fetch notifications',
                isLoading: false
            });
        }
    },

    fetchUnreadCount: async (userId) => {
        if (!userId) return;
        
        try {
            const result = await notificationService.getUnreadCount(userId);
            
            if (!result.error) {
                set({ unreadNotificationCount: result.count });
            }
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    },

    deleteNotification: async (id) => {
        try {
            const result = await notificationService.deleteNotification(id);
            
            if (!result.error) {
                set((state) => {
                    const notification = state.notifications.find(n => n.id === id);
                    const wasUnread = notification && !notification.read;
                    
                    return {
                        notifications: state.notifications.filter(n => n.id !== id),
                        unreadNotificationCount: wasUnread 
                            ? Math.max(0, state.unreadNotificationCount - 1) 
                            : state.unreadNotificationCount
                    };
                });
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    },

    setUnreadCount: (count) => set({ unreadNotificationCount: count }),

    toggleNotificationsDropdown: () => set((state) => ({
        isNotificationsOpen: !state.isNotificationsOpen
    })),

    closeNotificationsDropdown: () => set({
        isNotificationsOpen: false
    }),
});