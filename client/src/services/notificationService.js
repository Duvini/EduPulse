import axios from './axiosConfig';

/**
 * Service for interacting with the notifications API
 */
export const notificationService = {
  /**
   * Get all notifications for the current user
   */
  async getNotifications() {
    try {
      const response = await axios.get('/api/v1/notifications');
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return {
        error: true,
        message: error.response?.data?.message || 'Failed to fetch notifications'
      };
    }
  },

  /**
   * Get only unread notifications for the current user
   */
  async getUnreadNotifications() {
    try {
      const response = await axios.get('/api/v1/notifications/unread');
      return response.data;
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      return {
        error: true,
        message: error.response?.data?.message || 'Failed to fetch unread notifications'
      };
    }
  },

  /**
   * Get count of unread notifications
   */
  async getUnreadCount() {
    try {
      const response = await axios.get('/api/v1/notifications/count');
      return response.data;
    } catch (error) {
      console.error('Error fetching unread notification count:', error);
      return {
        error: true,
        message: error.response?.data?.message || 'Failed to fetch notification count'
      };
    }
  },

  /**
   * Mark a specific notification as read
   * @param {string} notificationId - ID of the notification to mark as read
   */
  async markAsRead(notificationId) {
    try {
      const response = await axios.put(`/api/v1/notifications/read/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return {
        error: true,
        message: error.response?.data?.message || 'Failed to mark notification as read'
      };
    }
  },

  /**
   * Mark all notifications as read for the current user
   */
  async markAllAsRead() {
    try {
      const response = await axios.put('/api/v1/notifications/read-all');
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return {
        error: true,
        message: error.response?.data?.message || 'Failed to mark all notifications as read'
      };
    }
  },

  /**
   * Long polling endpoint for real-time notifications
   * @param {number} lastTimestamp - Timestamp of the last check for notifications
   */
  async pollNotifications(lastTimestamp = null) {
    try {
      const url = lastTimestamp 
        ? `/api/v1/notifications/poll?lastTimestamp=${lastTimestamp}` 
        : '/api/v1/notifications/poll';
        
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error polling for notifications:', error);
      return {
        error: true,
        message: error.response?.data?.message || 'Failed to poll for notifications'
      };
    }
  }
};