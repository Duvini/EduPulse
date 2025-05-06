import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { authService } from '../services/authService';

const API_BASE_URL = '/api'; // Adjust according to your API base URL

// Connect to WebSocket for real-time notifications
export const connectToNotifications = (userId) => {
  if (!userId) return null;
  
  // Create SockJS and Stomp client
  const socket = new SockJS(`${API_BASE_URL}/ws`);
  const stompClient = Stomp.over(socket);
  
  const token = authService.getToken();
  const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
  
  // Connect to the WebSocket
  stompClient.connect(headers, () => {
    console.log('Connected to notification WebSocket');
    
    // Subscribe to user-specific notification channel
    stompClient.subscribe(`/user/${userId}/queue/notifications`, (message) => {
      try {
        const notification = JSON.parse(message.body);
        // Dispatch custom event with the new notification
        window.dispatchEvent(new CustomEvent('new-notification', { 
          detail: notification 
        }));
      } catch (error) {
        console.error('Error parsing notification message:', error);
      }
    });
    
    // Subscribe to notification count updates
    stompClient.subscribe(`/user/${userId}/queue/notification-count`, (message) => {
      try {
        const countData = JSON.parse(message.body);
        // Dispatch custom event with updated count
        window.dispatchEvent(new CustomEvent('notification-count-update', { 
          detail: countData 
        }));
      } catch (error) {
        console.error('Error parsing notification count message:', error);
      }
    });
  }, (error) => {
    console.error('WebSocket connection error:', error);
    if (error.headers && error.headers.message === 'Unauthorized') {
      // Handle unauthorized access - perhaps redirect to login
      window.location.href = '/signin';
    }
  });
  
  return stompClient;
};

// Disconnect from WebSocket
export const disconnectFromNotifications = (stompClient, userId) => {
  if (stompClient && stompClient.connected) {
    stompClient.disconnect(() => {
      console.log(`Disconnected user ${userId} from notification service`);
    });
  }
};

// Fetch notifications from API
export const fetchNotifications = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/notifications`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { data: null, error: error.message };
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (userId, notificationId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/users/${userId}/notifications/${notificationId}/read`, 
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/users/${userId}/notifications/read-all`, 
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Get unread notification count
export const getUnreadCount = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/notifications/unread-count`, {
      headers: {
        'Authorization': `Bearer ${authService.getToken()}`
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data.count;
  } catch (error) {
    console.error('Error fetching unread notification count:', error);
    return 0;  // Default to 0 on error
  }
};