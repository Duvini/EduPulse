import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBell } from 'react-icons/fi';
import { useStore } from '../../store';
import NotificationItem from './NotificationItem';
import { notificationService } from '../../services/notificationService';

const NotificationDropdown = ({ forwardedRef }) => {
  const { 
    notifications, 
    unreadNotificationCount, 
    isNotificationsOpen, 
    toggleNotificationsDropdown, 
    markAllNotificationsAsRead,
    markNotificationAsRead 
  } = useStore();
  
  const [displayNotifications, setDisplayNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch notifications when dropdown is opened
  useEffect(() => {
    if (isNotificationsOpen) {
      fetchNotifications();
    }
  }, [isNotificationsOpen]);

  // Set display notifications when store notifications change
  useEffect(() => {
    // Just show the latest 5 notifications in the dropdown
    setDisplayNotifications(notifications.slice(0, 5));
  }, [notifications]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await notificationService.getNotifications();
      if (!response.error) {
        // Notifications will be updated in the store
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markNotificationAsRead(notification.id);
    }
    // Navigation will be handled by the NotificationItem onClick prop
  };

  return (
    <div className="relative" ref={forwardedRef}>
      <button 
        className={`p-1.5 rounded-full transition-colors duration-200 flex items-center justify-center relative ${
          isNotificationsOpen ? 'bg-white/20' : 'hover:bg-white/10'
        }`}
        onClick={toggleNotificationsDropdown}
      >
        <FiBell className="text-xl" />
        {unreadNotificationCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
            {unreadNotificationCount}
          </span>
        )}
      </button>
      
      {isNotificationsOpen && (
        <div className="absolute right-0 z-20 mt-2 overflow-hidden bg-white rounded-md shadow-lg w-72">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            {unreadNotificationCount > 0 && (
              <button 
                className="text-xs text-blue-600 hover:text-blue-800"
                onClick={markAllNotificationsAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="overflow-y-auto max-h-80">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#4937ce]"></div>
              </div>
            ) : displayNotifications.length === 0 ? (
              <div className="py-6 text-center text-gray-500">No notifications</div>
            ) : (
              displayNotifications.map(notification => (
                <NotificationItem 
                  key={notification.id}
                  notification={notification}
                  onClick={() => handleNotificationClick(notification)}
                  onMarkAsRead={(id) => markNotificationAsRead(id)}
                />
              ))
            )}
          </div>
          
          <div className="px-4 py-2 text-center border-t border-gray-200">
            <Link to="/notifications" className="text-sm font-medium text-blue-600 hover:text-blue-800">
              See all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;