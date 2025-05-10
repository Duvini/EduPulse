package com.example.edupulse_backend.service;

import com.example.edupulse_backend.model.Notification;
import com.example.edupulse_backend.payload.response.ResponseDto;

public interface NotificationService {
    
    /**
     * Get all notifications for a user
     */
    ResponseDto getNotifications(String userId);
    
    /**
     * Get only unread notifications for a user
     */
    ResponseDto getUnreadNotifications(String userId);
    
    /**
     * Get count of unread notifications
     */
    ResponseDto getUnreadCount(String userId);
    
    /**
     * Mark a notification as read
     */
    ResponseDto markAsRead(String notificationId);
    
    /**
     * Mark all notifications as read for a user
     */
    ResponseDto markAllAsRead(String userId);
    
    /**
     * Poll for new notifications (for long polling implementation)
     */
    ResponseDto pollNotifications(String userId, Long lastPolledTimestamp);
    
    /**
     * Create and save a new notification
     */
    Notification createNotification(String recipientId, String senderId, String senderName,
                                  Notification.NotificationType type, String content);
    
    /**
     * Create a notification with optional post and comment IDs
     */
    Notification createDetailedNotification(String recipientId, String senderId, String senderName,
                                     String postId, String commentId,
                                     Notification.NotificationType type, String content);
}