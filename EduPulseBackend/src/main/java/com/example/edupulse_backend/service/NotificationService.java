<<<<<<< HEAD
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
    void createFollowNotification(String followerId, String followerName, String followedUserId);
=======
package com.example.edupulse_backend.service;

import com.example.edupulse_backend.payload.response.ResponseDto;
import java.time.LocalDateTime;

public interface NotificationService {
    ResponseDto getNotifications(String userId);
    ResponseDto getUnreadNotifications(String userId);
    ResponseDto markAsRead(String notificationId);
    ResponseDto markAllAsRead(String userId);
    ResponseDto getUnreadCount(String userId);
    
    // Methods for creating notifications based on user interactions
    void createLikeNotification(String postId, String likerId, String likerName, String postOwnerId);
    void createCommentNotification(String postId, String commentId, String commenterId, String commenterName, String postOwnerId);

    // New methods for time-based filtering
    ResponseDto getNotificationsByTimeRange(String userId, LocalDateTime startDateTime, LocalDateTime endDateTime);
    ResponseDto getTodayNotifications(String userId);
    ResponseDto getYesterdayNotifications(String userId);
    ResponseDto getLastWeekNotifications(String userId);
    ResponseDto getLastTwoWeeksNotifications(String userId);
    ResponseDto getLastMonthNotifications(String userId);
>>>>>>> 47a8b707de7c1b39b0a56824c1f1f28778a6d1dc
}