package com.example.edupulse_backend.service;

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
}