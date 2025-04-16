import React, { useEffect, useState } from 'react';
import './notificationComponent.css';
import { 
  connectToNotifications, 
  disconnectFromNotifications, 
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount
} from '../../constants/notificationService';

const NotificationComponent = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stompClient, setStompClient] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Connect to WebSocket when component mounts
  useEffect(() => {
    if (!userId) return;
    // Load initial data
    loadNotifications();
    loadUnreadCount();
    
    // Connect to WebSocket
    const client = connectToNotifications(userId);
    setStompClient(client);
    
    // Set up event listeners for real-time updates
    const handleNewNotification = (event) => {
      setNotifications(prev => [event.detail, ...prev]);
      setUnreadCount(prev => prev + 1);
    };
    
    const handleCountUpdate = (event) => {
      setUnreadCount(event.detail.count);
    };
    
    window.addEventListener('new-notification', handleNewNotification);
    window.addEventListener('notification-count-update', handleCountUpdate);
    
    // Clean up on unmount
    return () => {
      if (client) {
        disconnectFromNotifications(client, userId);
      }
      window.removeEventListener('new-notification', handleNewNotification);
      window.removeEventListener('notification-count-update', handleCountUpdate);
    };
  }, [userId]);
  
  // Load notifications from API
  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetchNotifications(userId);
      if (!response.error) {
        setNotifications(response.data || []);
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Load unread count from API
  const loadUnreadCount = async () => {
    try {
      const count = await getUnreadCount(userId);
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to load unread count:", error);
    }
  };
  
  // Handle clicking on a notification
  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await markNotificationAsRead(userId, notification.id);
        setNotifications(notifications.map(n => 
          n.id === notification.id ? { ...n, read: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }
    // Handle navigation or action based on notification type
    if (notification.link) {
      window.location.href = notification.link;
    }
  };
  
  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(userId);
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };
  
  // Toggle notification dropdown
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div className="notification-container">
      <button 
        className="notification-bell" 
        onClick={toggleDropdown}
        aria-label="Notifications"
      >
        <i className="bell-icon"></i>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>
      
      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button 
                className="mark-read-button"
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="notification-list">
            {loading ? (
              <div className="notification-loading">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">No notifications</div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-content">
                    <p>{notification.message}</p>
                    <span className="notification-time">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationComponent;