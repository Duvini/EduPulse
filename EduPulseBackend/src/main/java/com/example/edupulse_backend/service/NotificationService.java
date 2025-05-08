package com.example.edupulse_backend.service;

import com.example.edupulse_backend.model.Notification.NotificationType;
import com.example.edupulse_backend.payload.response.ResponseDto;

public interface NotificationService {
    ResponseDto getNotifications(String userId);
    ResponseDto getUnreadNotifications(String userId);
    ResponseDto markAsRead(String notificationId);
    ResponseDto markAllAsRead(String userId);
    ResponseDto getUnreadCount(String userId);
    
    // Methods for creating notifications based on user interactions
    void createLikeNotification(String postId, String likerId, String likerName, String postOwnerId);
    void createCommentNotification(String postId, String commentId, String commenterId, String commenterName, String postOwnerId);
    void createFollowNotification(String followerId, String followerName, String followedUserId);
    
    // Methods for custom and system notifications with more flexibility
    ResponseDto createCustomNotification(String recipientId, String senderId, String senderName, 
                                        NotificationType type, String content, String postId, String commentId);
    
    ResponseDto createSystemNotification(String recipientId, String content);
    
    // Methods for enhanced notification functionality
    ResponseDto createSystemNotificationForAllUsers(String content);
    
    ResponseDto createPostActivityNotification(String postId, String senderId, String action, 
                                              String commentId, String content);
    
    // Method to delete notification
    ResponseDto deleteNotification(String notificationId);
    
    // Methods to get notifications by criteria
    ResponseDto getNotificationsByType(String userId, NotificationType type);
    
    // New methods for additional GET endpoints
    ResponseDto getNotificationById(String notificationId, String userId);
    ResponseDto getPaginatedNotifications(String userId, int page, int size, NotificationType type, boolean unreadOnly);
    ResponseDto getLatestNotifications(String userId, int limit);
}