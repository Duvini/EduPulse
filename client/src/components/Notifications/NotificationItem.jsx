import React from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { FiHeart, FiMessageSquare, FiUserPlus, FiAtSign, FiBell, FiMessageCircle, FiCheck } from 'react-icons/fi';
import { getMediaUrl } from '../../services/axiosConfig';

const NotificationItem = ({ notification, onClick, onMarkAsRead }) => {
  // Default user avatar as SVG data URL
  const defaultUserAvatar = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23CBD5E1"%3E%3Cpath d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z"%3E%3C/path%3E%3C/svg%3E';
  
  // Get relative time
  const getRelativeTime = (dateString) => {
    try {
      const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error("Date parsing error:", error);
      return "recently";
    }
  };
  
  // Choose notification icon based on type
  const renderNotificationIcon = () => {
    const iconClass = "text-lg";
    
    switch (notification.type) {
      case 'LIKE':
        return <FiHeart className={`${iconClass} text-red-500`} />;
      case 'COMMENT':
        return <FiMessageSquare className={`${iconClass} text-blue-500`} />;
      case 'REPLY':
        return <FiMessageCircle className={`${iconClass} text-green-500`} />;
      case 'FOLLOW':
        return <FiUserPlus className={`${iconClass} text-purple-500`} />;
      case 'MENTION':
        return <FiAtSign className={`${iconClass} text-yellow-500`} />;
      case 'SYSTEM':
        return <FiBell className={`${iconClass} text-gray-500`} />;
      default:
        return <FiBell className={`${iconClass} text-gray-500`} />;
    }
  };
  
  // Get sender avatar URL
  const getSenderAvatar = () => {
    if (notification.type === 'SYSTEM') {
      return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234937ce"%3E%3Cpath d="M12 1.75l5.25 3v4.5c0 3.252-2.089 6.023-5 7.054V22h-0.5c-0.828 0-1.5-0.672-1.5-1.5V16.304c-2.911-1.031-5-3.802-5-7.054v-4.5L12 1.75zm0 14.304c2.761 0 5-2.239 5-5v-3.304l-5-2.886-5 2.886v3.304c0 2.761 2.239 5 5 5z"%3E%3C/path%3E%3C/svg%3E';
    }
    
    if (notification.senderAvatar) {
      return getMediaUrl(notification.senderAvatar);
    }
    
    return defaultUserAvatar;
  };

  // Handle mark as read button click
  const handleMarkAsRead = (e) => {
    e.stopPropagation();
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <div 
      className={`flex items-start px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${notification.read ? '' : 'bg-blue-50'}`}
      onClick={onClick}
    >
      <div className="mr-3 mt-1">
        <div className="relative">
          <img 
            src={getSenderAvatar()} 
            alt={notification.senderName || "System"} 
            className="w-10 h-10 rounded-full object-cover"
            onError={(e) => {
              e.target.src = defaultUserAvatar;
            }}
          />
          <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-white">
            {renderNotificationIcon()}
          </div>
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800">
          {notification.content}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {getRelativeTime(notification.createdAt)}
        </p>
      </div>
      
      {!notification.read && (
        <button 
          className="ml-2 p-1.5 text-gray-500 hover:bg-gray-200 rounded-full transition-colors duration-150 flex-shrink-0"
          onClick={handleMarkAsRead}
          aria-label="Mark as read"
          title="Mark as read"
        >
          <FiCheck className="text-lg" />
        </button>
      )}
    </div>
  );
};

export default NotificationItem;