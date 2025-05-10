import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiTrash2, FiCheck, FiFilter, FiChevronDown } from 'react-icons/fi';
import { useStore } from '../../../store';
import { formatDistanceToNow } from 'date-fns';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all'); // 'all', 'read', 'unread'
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('all'); // 'all', 'like', 'comment', 'follow', 'system'
  const {
    notifications,
    unreadNotificationCount,
    isLoading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    user
  } = useStore();

  useEffect(() => {
    if (user?.id) {
      fetchNotifications(user.id);
      fetchUnreadCount(user.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Filter notifications based on selected filter and type
  const filteredNotifications = notifications?.filter(notification => {
    // Filter by read/unread status
    if (filter === 'read' && !notification.read) return false;
    if (filter === 'unread' && notification.read) return false;
    
    // Filter by notification type
    if (selectedType !== 'all' && notification.type !== selectedType) return false;
    
    return true;
  });

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markNotificationAsRead(notification.id);
    }
    
    // Navigate based on notification type
    if (notification.type === 'LIKE' && notification.postId) {
      navigate(`/post/${notification.postId}`);
    } else if (notification.type === 'COMMENT' && notification.postId) {
      navigate(`/post/${notification.postId}`);
    } else if (notification.type === 'FOLLOW' && notification.senderId) {
      navigate(`/profile/${notification.senderId}`);
    }
  };

  // Get sender avatar based on notification
  const getSenderAvatar = (notification) => {
    // Default avatar as SVG data URL
    const defaultAvatar = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23CBD5E1"%3E%3Cpath d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z"%3E%3C/path%3E%3C/svg%3E';
    
    // For system notifications, use a system icon
    if (notification.type === 'SYSTEM') {
      return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234937ce"%3E%3Cpath d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-2a8 8 0 100-16 8 8 0 000 16zm0-9a1 1 0 011 1v4a1 1 0 11-2 0v-4a1 1 0 011-1zm0-4a1 1 0 110 2 1 1 0 010-2z"%3E%3C/path%3E%3C/svg%3E';
    }
    
    return defaultAvatar;
  };

  // Format notification time
  const formatNotificationTime = (createdAt) => {
    if (!createdAt) return '';
    
    try {
      const date = new Date(createdAt);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  // Get background color based on notification type
  const getBackgroundColor = (notification) => {
    if (!notification.read) {
      return 'bg-blue-50';
    }
    return 'bg-white';
  };

  return (
    <div className="container max-w-4xl px-4 py-6 mx-auto mt-16">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FiBell className="mr-2 text-2xl text-blue-600" />
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadNotificationCount > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
              {unreadNotificationCount}
            </span>
          )}
        </div>
        
        <div className="flex gap-2">
          {/* Filter dropdown */}
          <div className="relative">
            <button 
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <FiFilter className="mr-2" />
              {filter === 'all' ? 'All' : filter === 'read' ? 'Read' : 'Unread'}
              <FiChevronDown className="ml-2" />
            </button>
            
            {isFilterOpen && (
              <div className="absolute right-0 z-10 mt-1 bg-white rounded-md shadow-lg w-36">
                <ul className="py-1">
                  <li 
                    className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${filter === 'all' ? 'bg-gray-50 font-medium' : ''}`}
                    onClick={() => {
                      setFilter('all');
                      setIsFilterOpen(false);
                    }}
                  >
                    All
                  </li>
                  <li 
                    className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${filter === 'read' ? 'bg-gray-50 font-medium' : ''}`}
                    onClick={() => {
                      setFilter('read');
                      setIsFilterOpen(false);
                    }}
                  >
                    Read
                  </li>
                  <li 
                    className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${filter === 'unread' ? 'bg-gray-50 font-medium' : ''}`}
                    onClick={() => {
                      setFilter('unread');
                      setIsFilterOpen(false);
                    }}
                  >
                    Unread
                  </li>
                </ul>
              </div>
            )}
          </div>
          
          {/* Type filter */}
          <div className="relative">
            <select 
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 appearance-none cursor-pointer pr-8"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="LIKE">Likes</option>
              <option value="COMMENT">Comments</option>
              <option value="FOLLOW">Follows</option>
              <option value="SYSTEM">System</option>
            </select>
            <FiChevronDown className="absolute top-1/2 right-2 transform -translate-y-1/2 pointer-events-none" />
          </div>
          
          {/* Mark all as read button */}
          {unreadNotificationCount > 0 && (
            <button 
              className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              onClick={() => user?.id && markAllNotificationsAsRead(user.id)}
            >
              <FiCheck className="mr-2" />
              Mark all as read
            </button>
          )}
        </div>
      </div>
      
      {/* Notification list */}
      <div className="overflow-hidden bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : filteredNotifications?.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FiBell className="mx-auto mb-4 text-4xl text-gray-300" />
            <h3 className="mb-1 text-lg font-medium">No notifications</h3>
            <p>{filter !== 'all' ? `No ${filter} notifications found.` : 'You don\'t have any notifications yet.'}</p>
          </div>
        ) : (
          <ul>
            {filteredNotifications?.map(notification => (
              <li 
                key={notification.id}
                className={`${getBackgroundColor(notification)} hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100`}
              >
                <div 
                  className="flex items-start p-4 cursor-pointer"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="relative flex-shrink-0">
                    <img 
                      src={getSenderAvatar(notification)} 
                      alt="" 
                      className="object-cover w-10 h-10 rounded-full" 
                    />
                    {!notification.read && (
                      <div className="absolute top-0 right-0 w-3 h-3 bg-blue-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 ml-4">
                    <p className="text-sm text-gray-800">{notification.content}</p>
                    <p className="mt-1 text-xs text-gray-500">{formatNotificationTime(notification.createdAt)}</p>
                  </div>
                  
                  <div className="flex items-center ml-2">
                    {!notification.read && (
                      <button 
                        className="p-1.5 text-gray-400 rounded hover:bg-gray-100 hover:text-blue-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          markNotificationAsRead(notification.id);
                        }}
                        title="Mark as read"
                      >
                        <FiCheck size={16} />
                      </button>
                    )}
                    <button 
                      className="p-1.5 text-gray-400 rounded hover:bg-gray-100 hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      title="Delete notification"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;