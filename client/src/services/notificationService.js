import axios from './axiosConfig';

export const notificationService = {
  // Get all notifications for a user
  getNotifications: async (userId) => {
    try {
      const response = await axios.get(`/api/v1/notifications/user/${userId}`);
      return {
        error: false,
        data: response.data.data
      };
    } catch (error) {
      return {
        error: true,
        message: error.response?.data?.message || 'Error retrieving notifications'
      };
    }
  },

  // Get only unread notifications
  getUnreadNotifications: async (userId) => {
    try {
      const response = await axios.get(`/api/v1/notifications/unread/${userId}`);
      return {
        error: false,
        data: response.data.data
      };
    } catch (error) {
      return {
        error: true,
        message: error.response?.data?.message || 'Error retrieving unread notifications'
      };
    }
  },

  // Get count of unread notifications
  getUnreadCount: async (userId) => {
    try {
      const response = await axios.get(`/api/v1/notifications/count/${userId}`);
      return {
        error: false,
        count: response.data.data
      };
    } catch (error) {
      return {
        error: true,
        message: error.response?.data?.message || 'Error retrieving notification count'
      };
    }
  },

  // Mark a notification as read
  markAsRead: async (notificationId) => {
    try {
      const response = await axios.put(`/api/v1/notifications/read/${notificationId}`);
      return {
        error: false,
        data: response.data.data
      };
    } catch (error) {
      return {
        error: true,
        message: error.response?.data?.message || 'Error marking notification as read'
      };
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (userId) => {
    try {
      const response = await axios.put(`/api/v1/notifications/read-all/${userId}`);
      return {
        error: false,
        data: response.data.data
      };
    } catch (error) {
      return {
        error: true,
        message: error.response?.data?.message || 'Error marking all notifications as read'
      };
    }
  },

  // Delete a notification
  deleteNotification: async (notificationId) => {
    try {
      const response = await axios.delete(`/api/v1/notifications/${notificationId}`);
      return {
        error: false,
        message: response.data.message
      };
    } catch (error) {
      return {
        error: true,
        message: error.response?.data?.message || 'Error deleting notification'
      };
    }
  }
};