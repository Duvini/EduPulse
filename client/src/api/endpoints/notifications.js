import axiosInstance from '../../services/axiosConfig';

/**
 * API functions for interacting with notification endpoints
 */
export const notificationsApi = {
  /**
   * Get all notifications for current user
   */
  async getNotifications() {
    const response = await axiosInstance.get('/api/v1/notifications');
    return response.data;
  },

  /**
   * Get only unread notifications
   */
  async getUnreadNotifications() {
    const response = await axiosInstance.get('/api/v1/notifications/unread');
    return response.data;
  },

  /**
   * Get count of unread notifications
   */
  async getUnreadCount() {
    const response = await axiosInstance.get('/api/v1/notifications/count');
    return response.data;
  },

  /**
   * Mark a specific notification as read
   * @param {string} notificationId - ID of the notification to mark as read
   */
  async markAsRead(notificationId) {
    const response = await axiosInstance.put(`/api/v1/notifications/read/${notificationId}`);
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    const response = await axiosInstance.put('/api/v1/notifications/read-all');
    return response.data;
  },

  /**
   * Poll for new notifications since last check
   * @param {number} lastTimestamp - Timestamp of last check (optional)
   */
  async pollNotifications(lastTimestamp = null) {
    const url = lastTimestamp 
      ? `/api/v1/notifications/poll?lastTimestamp=${lastTimestamp}` 
      : '/api/v1/notifications/poll';
      
    const response = await axiosInstance.get(url);
    return response.data;
  }
};