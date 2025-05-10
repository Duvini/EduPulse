package com.example.edupulse_backend.service;

import com.example.edupulse_backend.model.Notification;
import com.example.edupulse_backend.payload.response.ResponseDto;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface NotificationService {
    // Create different types of notifications
    void createLikeNotification(String postId, String senderId, String senderName, String recipientId);
    void createCommentNotification(String postId, String commentId, String senderId, String senderName, String recipientId);
    void createFollowNotification(String senderId, String senderName, String recipientId);
    void createSystemNotification(String recipientId, String content);
    
    // Get notifications for a user
    ResponseDto getNotifications(String userId);
    
    // Get unread notifications for a user
    ResponseDto getUnreadNotifications(String userId);
    
    // Count unread notifications
    ResponseDto getUnreadCount(String userId);
    
    // Mark notification as read
    ResponseDto markAsRead(String notificationId);
    
    // Mark all notifications as read for a user
    ResponseDto markAllAsRead(String userId);
    
    // Delete notification
    ResponseDto deleteNotification(String notificationId, Authentication auth);
}