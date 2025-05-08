package com.example.edupulse_backend.service.impl;

import com.example.edupulse_backend.controller.WebSocketNotificationController;
import com.example.edupulse_backend.model.Notification;
import com.example.edupulse_backend.payload.response.ResponseDto;
import com.example.edupulse_backend.repository.NotificationRepository;
import com.example.edupulse_backend.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final WebSocketNotificationController webSocketController;

    // Constructor with one @Lazy component to break circular dependency
    public NotificationServiceImpl(
            NotificationRepository notificationRepository,
            @Lazy WebSocketNotificationController webSocketController) {
        this.notificationRepository = notificationRepository;
        this.webSocketController = webSocketController;
    }

    @Override
    public ResponseDto getNotifications(String userId) {
        log.info("Getting all notifications for user: {}", userId);
        List<Notification> notifications = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);
        return new ResponseDto(false, notifications);
    }

    @Override
    public ResponseDto getUnreadNotifications(String userId) {
        log.info("Getting unread notifications for user: {}", userId);
        List<Notification> unreadNotifications = notificationRepository.findByRecipientIdAndReadOrderByCreatedAtDesc(userId, false);
        return new ResponseDto(false, unreadNotifications);
    }

    @Override
    @Transactional
    public ResponseDto markAsRead(String notificationId) {
        log.info("Marking notification as read: {}", notificationId);
        Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
        
        if (notificationOpt.isPresent()) {
            Notification notification = notificationOpt.get();
            notification.setRead(true);
            notificationRepository.save(notification);
            
            // Send updated unread count via WebSocket
            webSocketController.sendUnreadCount(notification.getRecipientId());
            
            return new ResponseDto(false, "Notification marked as read");
        }
        
        return new ResponseDto(true, "Notification not found");
    }

    @Override
    @Transactional
    public ResponseDto markAllAsRead(String userId) {
        log.info("Marking all notifications as read for user: {}", userId);
        
        // Better approach - bulk update
        List<Notification> notifications = notificationRepository.findByRecipientIdAndReadOrderByCreatedAtDesc(userId, false);
        if (!notifications.isEmpty()) {
            notifications.forEach(notification -> notification.setRead(true));
            notificationRepository.saveAll(notifications);
            
            // Send updated unread count via WebSocket
            webSocketController.sendUnreadCount(userId);
        }
        
        return new ResponseDto(false, "All notifications marked as read");
    }

    @Override
    public ResponseDto getUnreadCount(String userId) {
        log.info("Getting unread notification count for user: {}", userId);
        long count = notificationRepository.countByRecipientIdAndRead(userId, false);
        return new ResponseDto(false, count);
    }

    @Override
    @Transactional
    public void createLikeNotification(String postId, String likerId, String likerName, String postOwnerId) {
        // Don't notify if user likes their own post
        if (likerId.equals(postOwnerId)) {
            return;
        }
        
        log.info("Creating like notification: {} liked a post by {}", likerId, postOwnerId);
        
        // Check if similar notification exists recently to prevent spam
        List<Notification> recentNotifications = notificationRepository.findByRecipientIdAndSenderIdAndTypeAndCreatedAtAfter(
                postOwnerId, likerId, Notification.NotificationType.LIKE, 
                LocalDateTime.now(ZoneOffset.UTC).minusMinutes(5)); // Check last 5 minutes with explicit UTC
                
        if (!recentNotifications.isEmpty()) {
            log.info("Recent like notification already exists, skipping");
            return;
        }
        
        Notification notification = Notification.builder()
                .recipientId(postOwnerId)
                .senderId(likerId)
                .senderName(likerName)
                .postId(postId)
                .type(Notification.NotificationType.LIKE)
                .content(likerName + " liked your post")
                .read(false)
                .createdAt(LocalDateTime.now(ZoneOffset.UTC))
                .build();
        
        notification = notificationRepository.save(notification);
        
        // Use the WebSocketController to send notification if user is connected
        sendRealTimeNotification(postOwnerId, notification);
    }

    @Override
    @Transactional
    public void createCommentNotification(String postId, String commentId, String commenterId, String commenterName, String postOwnerId) {
        // Don't notify if user comments on their own post
        if (commenterId.equals(postOwnerId)) {
            return;
        }
        
        log.info("Creating comment notification: {} commented on a post by {}", commenterId, postOwnerId);
        
        // Check if similar notification exists recently to prevent spam
        List<Notification> recentNotifications = notificationRepository.findByRecipientIdAndSenderIdAndTypeAndCreatedAtAfter(
                postOwnerId, commenterId, Notification.NotificationType.COMMENT, 
                LocalDateTime.now(ZoneOffset.UTC).minusMinutes(2)); // Check last 2 minutes with explicit UTC
                
        if (!recentNotifications.isEmpty()) {
            log.info("Recent comment notification already exists, skipping");
            return;
        }
        
        Notification notification = Notification.builder()
                .recipientId(postOwnerId)
                .senderId(commenterId)
                .senderName(commenterName)
                .postId(postId)
                .commentId(commentId)
                .type(Notification.NotificationType.COMMENT)
                .content(commenterName + " commented on your post")
                .read(false)
                .createdAt(LocalDateTime.now(ZoneOffset.UTC))
                .build();
        
        notification = notificationRepository.save(notification);
        
        // Use the WebSocketController to send notification if user is connected
        sendRealTimeNotification(postOwnerId, notification);
    }

    @Override
    @Transactional
    public void createFollowNotification(String followerId, String followerName, String followedUserId) {
        // Don't notify if a user follows themselves (shouldn't happen, but just in case)
        if (followerId.equals(followedUserId)) {
            return;
        }
        
        log.info("Creating follow notification: {} is now following {}", followerId, followedUserId);
        
        // Check if similar notification exists recently to prevent spam
        List<Notification> recentNotifications = notificationRepository.findByRecipientIdAndSenderIdAndTypeAndCreatedAtAfter(
                followedUserId, followerId, Notification.NotificationType.FOLLOW, 
                LocalDateTime.now(ZoneOffset.UTC).minusMinutes(5)); // Check last 5 minutes with explicit UTC
                
        if (!recentNotifications.isEmpty()) {
            log.info("Recent follow notification already exists, skipping");
            return;
        }
        
        Notification notification = Notification.builder()
                .recipientId(followedUserId)
                .senderId(followerId)
                .senderName(followerName)
                .type(Notification.NotificationType.FOLLOW)
                .content(followerName + " started following you")
                .read(false)
                .createdAt(LocalDateTime.now(ZoneOffset.UTC))
                .build();
        
        notification = notificationRepository.save(notification);
        
        // Use the WebSocketController to send notification if user is connected
        sendRealTimeNotification(followedUserId, notification);
    }
    
    // Helper method to send real-time notifications using WebSocketController
    private void sendRealTimeNotification(String userId, Notification notification) {
        try {
            // Check if user is connected before sending
            if (webSocketController.isUserConnected(userId)) {
                webSocketController.sendNotification(userId, notification);
                log.debug("Real-time notification sent to user: {}", userId);
            } else {
                // User not connected, notification is saved to DB but no real-time send
                log.debug("User not connected, real-time notification skipped: {}", userId);
            }
            
            // Also send updated count - this will only be received if user is connected
            webSocketController.sendUnreadCount(userId);
        } catch (Exception e) {
            log.error("Error sending real-time notification: {}", e.getMessage());
        }
    }
}