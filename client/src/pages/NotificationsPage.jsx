import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle, FiClock, FiFilter } from 'react-icons/fi';
import { useStore } from '../../store';
import { notificationService } from '../services/notificationService';
import NotificationItem from '../components/Notifications/NotificationItem';
import { toast } from 'react-toastify';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const { markAllNotificationsAsRead, setUnreadCount, setNotifications: updateStoreNotifications } = useStore();

  useEffect(() => {
    fetchNotifications();
    // Setup polling for real-time notifications
    const pollingInterval = setInterval(() => {
      fetchNewNotifications();
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(pollingInterval);
  }, []);

  useEffect(() => {
    filterNotifications(activeFilter);
  }, [notifications, activeFilter]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await notificationService.getNotifications();
      console.log("Notifications response:", response);
      if (!response.error) {
        // Check if response has the correct structure
        const notificationsData = response.data || response;
        setNotifications(notificationsData);
        // Also update notifications in the store
        updateStoreNotifications(notificationsData);
      } else {
        toast.error("Failed to fetch notifications");
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Error loading notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNewNotifications = async () => {
    try {
      // Get timestamp of most recent notification
      const lastNotificationTime = notifications.length > 0 
        ? new Date(notifications[0].createdAt).getTime() 
        : Date.now();
      
      const response = await notificationService.pollNotifications(lastNotificationTime);
      if (!response.error && response.data.notifications && response.data.notifications.length > 0) {
        // Merge new notifications with existing ones
        const newNotifications = response.data.notifications;
        setNotifications(prev => {
          const merged = [...newNotifications, ...prev];
          // Remove duplicates based on ID
          const uniqueNotifications = merged.filter((item, index, self) => 
            index === self.findIndex(t => t.id === item.id)
          );
          return uniqueNotifications;
        });
        
        // Update unread count in the store
        fetchUnreadCount();
        
        // Show toast for new notifications
        if (newNotifications.length > 0) {
          toast.info(`You have ${newNotifications.length} new notification${newNotifications.length > 1 ? 's' : ''}`);
        }
      }
    } catch (error) {
      console.error("Error polling for new notifications:", error);
    }
  };

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

  const handleMarkAllAsRead = async () => {
    try {
      const response = await notificationService.markAllAsRead();
      if (!response.error) {
        // Update local state
        setNotifications(prev => prev.map(notification => ({
          ...notification,
          read: true
        })));
        
        // Update store
        markAllNotificationsAsRead();
        toast.success("All notifications marked as read");
      } else {
        toast.error("Failed to mark notifications as read");
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Error marking notifications as read");
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await notificationService.markAsRead(notificationId);
      if (!response.error) {
        // Update local state
        setNotifications(prev => prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        ));
        
        // Update unread count
        fetchUnreadCount();
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const filterNotifications = (filter) => {
    switch (filter) {
      case 'unread':
        setFilteredNotifications(notifications.filter(notification => !notification.read));
        break;
      case 'comments':
        setFilteredNotifications(notifications.filter(notification => 
          notification.type === 'COMMENT' || notification.type === 'REPLY'
        ));
        break;
      case 'likes':
        setFilteredNotifications(notifications.filter(notification => notification.type === 'LIKE'));
        break;
      case 'follows':
        setFilteredNotifications(notifications.filter(notification => notification.type === 'FOLLOW'));
        break;
      case 'mentions':
        setFilteredNotifications(notifications.filter(notification => notification.type === 'MENTION'));
        break;
      case 'system':
        setFilteredNotifications(notifications.filter(notification => notification.type === 'SYSTEM'));
        break;
      case 'all':
      default:
        setFilteredNotifications(notifications);
        break;
    }
  };

  const handleNavigateToItem = (notification) => {
    // Mark as read if unread
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    
    // Navigate based on notification type
    if (notification.postId) {
      navigate(`/post/${notification.postId}`);
    } else if (notification.type === 'FOLLOW') {
      navigate(`/profile/${notification.senderId}`);
    } else {
      console.log("No navigation path for this notification type");
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  const renderFilterButtons = () => {
    const filters = [
      { id: 'all', label: 'All' },
      { id: 'unread', label: 'Unread' },
      { id: 'comments', label: 'Comments' },
      { id: 'likes', label: 'Likes' },
      { id: 'follows', label: 'Follows' },
      { id: 'mentions', label: 'Mentions' },
      { id: 'system', label: 'System' }
    ];

    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {filters.map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`px-3 py-1 text-sm rounded-full ${
              activeFilter === filter.id
                ? 'bg-[#4937ce] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto pb-16 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={goBack}
            className="p-2 text-gray-500 rounded-full hover:bg-gray-100"
          >
            <FiArrowLeft className="text-xl" />
          </button>
          <h1 className="text-2xl font-bold">Notifications</h1>
        </div>
        <button
          onClick={handleMarkAllAsRead}
          disabled={!notifications.some(n => !n.read)}
          className={`flex items-center px-3 py-1.5 rounded-full text-sm ${
            notifications.some(n => !n.read)
              ? 'bg-[#4937ce] text-white hover:bg-[#3b2ca3]'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          <FiCheckCircle className="mr-1" />
          Mark all read
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 overflow-x-auto scrollbar-hide">
        <div className="inline-flex items-center space-x-1 pb-2">
          <FiFilter className="ml-1 text-gray-500" />
          {renderFilterButtons()}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="flex justify-center items-center p-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4937ce]"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-16 text-center text-gray-500">
            <FiClock className="mx-auto text-4xl mb-2" />
            <p>No notifications to display</p>
            {activeFilter !== 'all' && (
              <button 
                onClick={() => setActiveFilter('all')}
                className="mt-2 text-[#4937ce] hover:underline"
              >
                View all notifications
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={() => handleNavigateToItem(notification)}
                onMarkAsRead={() => handleMarkAsRead(notification.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;