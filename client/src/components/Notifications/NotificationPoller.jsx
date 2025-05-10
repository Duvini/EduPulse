import { useEffect } from 'react';
import { notificationService } from '../../services/notificationService';
import { useStore } from '../../store';
import { toast } from 'react-toastify';

/**
 * Component for polling notifications in the background
 * This should be mounted once at the app level
 */
const NotificationPoller = () => {
  const { 
    lastPolledTimestamp, 
    addNotifications, 
    setLastPolledTimestamp,
    setUnreadCount
  } = useStore();

  // Poll for new notifications
  useEffect(() => {
    const pollForNotifications = async () => {
      try {
        const response = await notificationService.pollNotifications(lastPolledTimestamp);
        
        if (!response.error && response.data && response.data.notifications) {
          const newNotifications = response.data.notifications;
          
          if (newNotifications.length > 0) {
            // Add notifications to the store
            addNotifications(newNotifications);
            
            // Update the last polled timestamp
            setLastPolledTimestamp(response.data.timestamp || Date.now());
            
            // Fetch updated unread count
            updateUnreadCount();
            
            // Show toast notification if there are new unread notifications
            const unreadCount = newNotifications.filter(n => !n.read).length;
            if (unreadCount > 0) {
              toast.info(
                `You have ${unreadCount} new notification${unreadCount > 1 ? 's' : ''}`, 
                { autoClose: 3000 }
              );
            }
          }
        }
      } catch (error) {
        console.error('Error polling for notifications:', error);
      }
    };
    
    // Initial poll on mount
    pollForNotifications();
    
    // Set up interval for regular polling
    const pollingInterval = setInterval(pollForNotifications, 30000); // Poll every 30 seconds
    
    return () => clearInterval(pollingInterval);
  }, [lastPolledTimestamp, addNotifications, setLastPolledTimestamp]);
  
  // Update unread count separately
  const updateUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      if (!response.error && response.data) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('Error updating unread count:', error);
    }
  };

  // This component doesn't render anything
  return null;
};

export default NotificationPoller;