import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../../services/notificationService';

/**
 * Hook to fetch all notifications
 */
export const useGetNotifications = (options = {}) => {
  return useQuery(
    ['notifications'],
    async () => {
      const response = await notificationService.getNotifications();
      if (response.error) {
        throw new Error(response.message || 'Failed to load notifications');
      }
      return response;
    },
    {
      staleTime: 30000, // 30 seconds
      refetchOnWindowFocus: true,
      ...options
    }
  );
};

/**
 * Hook to fetch only unread notifications
 */
export const useGetUnreadNotifications = (options = {}) => {
  return useQuery(
    ['unreadNotifications'],
    async () => {
      const response = await notificationService.getUnreadNotifications();
      if (response.error) {
        throw new Error(response.message || 'Failed to load unread notifications');
      }
      return response;
    },
    {
      staleTime: 30000,
      ...options
    }
  );
};

/**
 * Hook to get the count of unread notifications
 */
export const useGetUnreadCount = (options = {}) => {
  return useQuery(
    ['unreadCount'],
    async () => {
      const response = await notificationService.getUnreadCount();
      if (response.error) {
        throw new Error(response.message || 'Failed to get unread count');
      }
      return response;
    },
    {
      staleTime: 30000,
      ...options
    }
  );
};

/**
 * Hook to mark a notification as read
 */
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (notificationId) => notificationService.markAsRead(notificationId),
    {
      onSuccess: () => {
        // Invalidate and refetch relevant queries
        queryClient.invalidateQueries(['notifications']);
        queryClient.invalidateQueries(['unreadNotifications']);
        queryClient.invalidateQueries(['unreadCount']);
      }
    }
  );
};

/**
 * Hook to mark all notifications as read
 */
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    () => notificationService.markAllAsRead(),
    {
      onSuccess: () => {
        // Invalidate and refetch relevant queries
        queryClient.invalidateQueries(['notifications']);
        queryClient.invalidateQueries(['unreadNotifications']);
        queryClient.invalidateQueries(['unreadCount']);
      }
    }
  );
};

/**
 * Hook for polling new notifications
 */
export const usePollNotifications = (lastTimestamp, options = {}) => {
  return useQuery(
    ['pollNotifications', lastTimestamp],
    async () => {
      const response = await notificationService.pollNotifications(lastTimestamp);
      if (response.error) {
        throw new Error(response.message || 'Failed to poll notifications');
      }
      return response;
    },
    {
      refetchInterval: options.refetchInterval || 30000,
      refetchOnWindowFocus: true,
      ...options
    }
  );
};