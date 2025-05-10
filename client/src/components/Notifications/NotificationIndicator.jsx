import React, { useRef, useEffect } from 'react';
import { useStore } from '../../store';
import NotificationDropdown from './NotificationDropdown';
import { notificationService } from '../../services/notificationService';

/**
 * NotificationIndicator component
 * Displays a notification bell with unread count in the navbar
 * Opens a dropdown with recent notifications when clicked
 */
const NotificationIndicator = () => {
  const { 
    unreadNotificationCount, 
    setUnreadCount,
    isNotificationsOpen,
    closeNotificationsDropdown
  } = useStore();
  
  const notificationRef = useRef(null);

  // Fetch unread notification count on component mount
  useEffect(() => {
    fetchUnreadCount();
  }, []);

  // Handle click outside notifications dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        closeNotificationsDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeNotificationsDropdown]);

  // Fetch unread notification count
  const fetchUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      if (!response.error) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  return (
    <NotificationDropdown 
      forwardedRef={notificationRef} 
    />
  );
};

export default NotificationIndicator;