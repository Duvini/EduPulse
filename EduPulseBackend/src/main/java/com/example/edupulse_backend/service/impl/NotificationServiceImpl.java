package com.example.edupulse_backend.service.impl;

import com.example.edupulse_backend.controller.WebSocketNotificationController;
import com.example.edupulse_backend.model.Notification;
import com.example.edupulse_backend.model.Notification.NotificationType;
import com.example.edupulse_backend.payload.response.ResponseDto;
import com.example.edupulse_backend.repository.NotificationRepository;
import com.example.edupulse_backend.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.HashMap;
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
                postOwnerId, likerId, NotificationType.LIKE, 
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
                .type(NotificationType.LIKE)
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
                postOwnerId, commenterId, NotificationType.COMMENT, 
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
                .type(NotificationType.COMMENT)
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
                followedUserId, followerId, NotificationType.FOLLOW, 
                LocalDateTime.now(ZoneOffset.UTC).minusMinutes(5)); // Check last 5 minutes with explicit UTC
                
        if (!recentNotifications.isEmpty()) {
            log.info("Recent follow notification already exists, skipping");
            return;
        }
        
        Notification notification = Notification.builder()
                .recipientId(followedUserId)
                .senderId(followerId)
                .senderName(followerName)
                .type(NotificationType.FOLLOW)
                .content(followerName + " started following you")
                .read(false)
                .createdAt(LocalDateTime.now(ZoneOffset.UTC))
                .build();
        
        notification = notificationRepository.save(notification);
        
        // Use the WebSocketController to send notification if user is connected
        sendRealTimeNotification(followedUserId, notification);
    }

    @Override
    @Transactional
    public ResponseDto createCustomNotification(String recipientId, String senderId, String senderName,
                                              NotificationType type, String content, String postId, String commentId) {
        log.info("Creating custom notification for recipient: {}", recipientId);
        
        try {
            Notification notification = Notification.builder()
                    .recipientId(recipientId)
                    .senderId(senderId)
                    .senderName(senderName)
                    .type(type)
                    .content(content)
                    .postId(postId)
                    .commentId(commentId)
                    .read(false)
                    .createdAt(LocalDateTime.now(ZoneOffset.UTC))
                    .build();
            
            notification = notificationRepository.save(notification);
            
            // Send real-time notification
            sendRealTimeNotification(recipientId, notification);
            
            return new ResponseDto(false, notification);
        } catch (Exception e) {
            log.error("Error creating custom notification: {}", e.getMessage());
            return new ResponseDto(true, "Failed to create notification: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public ResponseDto createSystemNotification(String recipientId, String content) {
        log.info("Creating system notification for recipient: {}", recipientId);
        
        try {
            Notification notification = Notification.builder()
                    .recipientId(recipientId)
                    .senderId("SYSTEM")
                    .senderName("System")
                    .type(NotificationType.SYSTEM)
                    .content(content)
                    .read(false)
                    .createdAt(LocalDateTime.now(ZoneOffset.UTC))
                    .build();
            
            notification = notificationRepository.save(notification);
            
            // Send real-time notification
            sendRealTimeNotification(recipientId, notification);
            
            return new ResponseDto(false, notification);
        } catch (Exception e) {
            log.error("Error creating system notification: {}", e.getMessage());
            return new ResponseDto(true, "Failed to create system notification: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public ResponseDto createSystemNotificationForAllUsers(String content) {
        log.info("Creating system notification for all users");
        
        try {
            // Get all users from database
            List<String> allUserIds = getUserRepository().findAllUserIds();
            int sentCount = 0;
            
            for (String userId : allUserIds) {
                Notification notification = Notification.builder()
                        .recipientId(userId)
                        .senderId("SYSTEM")
                        .senderName("System")
                        .type(NotificationType.SYSTEM)
                        .content(content)
                        .read(false)
                        .createdAt(LocalDateTime.now(ZoneOffset.UTC))
                        .build();
                
                notification = notificationRepository.save(notification);
                
                // Send real-time notification to each user
                sendRealTimeNotification(userId, notification);
                sentCount++;
            }
            
            return new ResponseDto(false, "System notification sent to " + sentCount + " users");
        } catch (Exception e) {
            log.error("Error creating system notification for all users: {}", e.getMessage());
            return new ResponseDto(true, "Failed to create system notifications: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public ResponseDto createPostActivityNotification(String postId, String senderId, String action, 
                                                     String commentId, String content) {
        log.info("Creating {} notification for post ID: {}", action, postId);
        
        try {
            // First, determine the post owner (recipient of the notification)
            Optional<String> postOwnerIdOpt = getPostOwnerId(postId);
            if (postOwnerIdOpt.isEmpty()) {
                return new ResponseDto(true, "Post not found or has no owner");
            }
            
            String postOwnerId = postOwnerIdOpt.get();
            
            // Don't create notification if sender is the same as post owner
            if (senderId.equals(postOwnerId)) {
                return new ResponseDto(false, "No notification created: sender is post owner");
            }
            
            // Get sender's name
            String senderName = getUserName(senderId);
            if (senderName == null) {
                senderName = "Unknown User";
            }
            
            // Determine notification type and content based on action
            NotificationType type;
            String notificationContent;
            
            switch (action.toLowerCase()) {
                case "like":
                    type = NotificationType.LIKE;
                    notificationContent = senderName + " liked your post";
                    break;
                case "comment":
                    type = NotificationType.COMMENT;
                    notificationContent = senderName + " commented on your post";
                    break;
                case "reply":
                    type = NotificationType.REPLY;
                    notificationContent = senderName + " replied to your comment";
                    break;
                case "mention":
                    type = NotificationType.MENTION;
                    notificationContent = senderName + " mentioned you in a post";
                    break;
                default:
                    type = NotificationType.SYSTEM;
                    notificationContent = senderName + " interacted with your post";
            }
            
            // If custom content is provided, use that instead
            if (content != null && !content.trim().isEmpty()) {
                notificationContent = content;
            }
            
            // Create and save notification
            Notification notification = Notification.builder()
                    .recipientId(postOwnerId)
                    .senderId(senderId)
                    .senderName(senderName)
                    .type(type)
                    .content(notificationContent)
                    .postId(postId)
                    .commentId(commentId)
                    .read(false)
                    .createdAt(LocalDateTime.now(ZoneOffset.UTC))
                    .build();
            
            notification = notificationRepository.save(notification);
            
            // Send real-time notification
            sendRealTimeNotification(postOwnerId, notification);
            
            return new ResponseDto(false, notification);
        } catch (Exception e) {
            log.error("Error creating post activity notification: {}", e.getMessage());
            return new ResponseDto(true, "Failed to create notification: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public ResponseDto deleteNotification(String notificationId) {
        log.info("Deleting notification with ID: {}", notificationId);
        
        try {
            Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
            
            if (notificationOpt.isEmpty()) {
                return new ResponseDto(true, "Notification not found");
            }
            
            Notification notification = notificationOpt.get();
            String recipientId = notification.getRecipientId();
            
            notificationRepository.delete(notification);
            
            // Update unread count via WebSocket if the deleted notification was unread
            if (!notification.isRead()) {
                webSocketController.sendUnreadCount(recipientId);
            }
            
            return new ResponseDto(false, "Notification successfully deleted");
        } catch (Exception e) {
            log.error("Error deleting notification: {}", e.getMessage());
            return new ResponseDto(true, "Failed to delete notification: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto getNotificationsByType(String userId, NotificationType type) {
        log.info("Getting notifications of type {} for user: {}", type, userId);
        try {
            List<Notification> notifications = notificationRepository.findByRecipientIdAndTypeOrderByCreatedAtDesc(userId, type);
            return new ResponseDto(false, notifications);
        } catch (Exception e) {
            log.error("Error fetching notifications by type: {}", e.getMessage());
            return new ResponseDto(true, "Failed to fetch notifications: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto getNotificationById(String notificationId, String userId) {
        log.info("Getting notification by ID: {} for user: {}", notificationId, userId);
        try {
            Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
            
            if (notificationOpt.isEmpty()) {
                return new ResponseDto(true, "Notification not found");
            }
            
            Notification notification = notificationOpt.get();
            
            // Security check: make sure the user requesting the notification is the recipient
            if (!notification.getRecipientId().equals(userId)) {
                log.warn("User {} attempted to access notification {} belonging to {}", 
                        userId, notificationId, notification.getRecipientId());
                return new ResponseDto(true, "Access denied: you can only view your own notifications");
            }
            
            return new ResponseDto(false, notification);
        } catch (Exception e) {
            log.error("Error fetching notification by ID: {}", e.getMessage());
            return new ResponseDto(true, "Failed to fetch notification: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto getPaginatedNotifications(String userId, int page, int size, 
                                               NotificationType type, boolean unreadOnly) {
        log.info("Getting paginated notifications for user: {}, page: {}, size: {}, type: {}, unreadOnly: {}", 
                userId, page, size, type, unreadOnly);
        
        try {
            // Calculate pagination parameters
            int skip = page * size;
            int limit = size;
            
            // Find the notifications based on criteria
            List<Notification> notifications;
            if (type != null && unreadOnly) {
                notifications = notificationRepository.findByRecipientIdAndTypeAndReadOrderByCreatedAtDesc(
                        userId, type, false, skip, limit);
            } else if (type != null) {
                notifications = notificationRepository.findByRecipientIdAndTypeWithPagination(
                        userId, type, skip, limit);
            } else if (unreadOnly) {
                notifications = notificationRepository.findByRecipientIdAndReadWithPagination(
                        userId, false, skip, limit);
            } else {
                notifications = notificationRepository.findByRecipientIdWithPagination(
                        userId, skip, limit);
            }
            
            // Get total count for pagination metadata
            long totalCount;
            if (type != null && unreadOnly) {
                totalCount = notificationRepository.countByRecipientIdAndTypeAndRead(userId, type, false);
            } else if (type != null) {
                totalCount = notificationRepository.countByRecipientIdAndType(userId, type);
            } else if (unreadOnly) {
                totalCount = notificationRepository.countByRecipientIdAndRead(userId, false);
            } else {
                totalCount = notificationRepository.countByRecipientId(userId);
            }
            
            // Create pagination metadata
            Map<String, Object> response = new HashMap<>();
            response.put("notifications", notifications);
            response.put("currentPage", page);
            response.put("totalItems", totalCount);
            response.put("totalPages", (int) Math.ceil((double) totalCount / size));
            
            return new ResponseDto(false, response);
        } catch (Exception e) {
            log.error("Error fetching paginated notifications: {}", e.getMessage());
            return new ResponseDto(true, "Failed to fetch notifications: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto getLatestNotifications(String userId, int limit) {
        log.info("Getting latest {} notifications for user: {}", limit, userId);
        try {
            List<Notification> notifications = notificationRepository.findTopByRecipientIdOrderByCreatedAtDesc(
                    userId, limit);
            
            return new ResponseDto(false, notifications);
        } catch (Exception e) {
            log.error("Error fetching latest notifications: {}", e.getMessage());
            return new ResponseDto(true, "Failed to fetch latest notifications: " + e.getMessage());
        }
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
    
    // Helper methods
    
    private UserRepository getUserRepository() {
        // This is a placeholder. You would need to autowire UserRepository in the constructor.
        // For now, we'll return a mock implementation
        return new UserRepository() {
            @Override
            public List<String> findAllUserIds() {
                // In a real implementation, this would query the database
                // For now, returning an empty list
                return new ArrayList<>();
            }
        };
    }
    
    private Optional<String> getPostOwnerId(String postId) {
        // This is a placeholder. In a real implementation, 
        // you would query your post repository to find the post owner
        // Return empty for now
        return Optional.empty();
    }
    
    private String getUserName(String userId) {
        // This is a placeholder. In a real implementation,
        // you would query your user repository to find the user's name
        return null;
    }
    
    // Interface for UserRepository (placeholder)
    private interface UserRepository {
        List<String> findAllUserIds();
    }
}