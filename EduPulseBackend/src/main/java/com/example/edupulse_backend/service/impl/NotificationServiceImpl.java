package com.example.edupulse_backend.service.impl;

import com.example.edupulse_backend.exception.ResourceNotFoundException;
import com.example.edupulse_backend.model.Notification;
import com.example.edupulse_backend.model.User;
import com.example.edupulse_backend.payload.response.ResponseDto;
import com.example.edupulse_backend.repository.NotificationRepository;
import com.example.edupulse_backend.repository.UserRepository;
import com.example.edupulse_backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    public void createLikeNotification(String postId, String senderId, String senderName, String recipientId) {
        // Don't notify users about their own actions
        if (senderId.equals(recipientId)) {
            return;
        }

        Notification notification = Notification.builder()
                .recipientId(recipientId)
                .senderId(senderId)
                .senderName(senderName)
                .postId(postId)
                .type(Notification.NotificationType.LIKE)
                .content(senderName + " liked your post")
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);
        log.info("Created like notification from {} to {}", senderId, recipientId);
    }

    @Override
    public void createCommentNotification(String postId, String commentId, String senderId, String senderName, String recipientId) {
        // Don't notify users about their own actions
        if (senderId.equals(recipientId)) {
            return;
        }

        Notification notification = Notification.builder()
                .recipientId(recipientId)
                .senderId(senderId)
                .senderName(senderName)
                .postId(postId)
                .commentId(commentId)
                .type(Notification.NotificationType.COMMENT)
                .content(senderName + " commented on your post")
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);
        log.info("Created comment notification from {} to {}", senderId, recipientId);
    }

    @Override
    public void createFollowNotification(String senderId, String senderName, String recipientId) {
        // Don't notify users about their own actions
        if (senderId.equals(recipientId)) {
            return;
        }

        Notification notification = Notification.builder()
                .recipientId(recipientId)
                .senderId(senderId)
                .senderName(senderName)
                .type(Notification.NotificationType.FOLLOW)
                .content(senderName + " started following you")
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);
        log.info("Created follow notification from {} to {}", senderId, recipientId);
    }

    @Override
    public void createSystemNotification(String recipientId, String content) {
        Notification notification = Notification.builder()
                .recipientId(recipientId)
                .type(Notification.NotificationType.SYSTEM)
                .content(content)
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);
        log.info("Created system notification for {}: {}", recipientId, content);
    }

    @Override
    public ResponseDto getNotifications(String userId) {
        try {
            List<Notification> notifications = notificationRepository.findByRecipientId(userId);
            log.info("Retrieved {} notifications for user {}", notifications.size(), userId);
            return new ResponseDto(false, notifications);
        } catch (Exception e) {
            log.error("Error retrieving notifications for user {}: {}", userId, e.getMessage());
            return new ResponseDto(true, "Error retrieving notifications: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto getUnreadNotifications(String userId) {
        try {
            List<Notification> notifications = notificationRepository.findByRecipientIdAndReadFalse(userId);
            log.info("Retrieved {} unread notifications for user {}", notifications.size(), userId);
            return new ResponseDto(false, notifications);
        } catch (Exception e) {
            log.error("Error retrieving unread notifications for user {}: {}", userId, e.getMessage());
            return new ResponseDto(true, "Error retrieving unread notifications: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto getUnreadCount(String userId) {
        try {
            long count = notificationRepository.countByRecipientIdAndReadFalse(userId);
            log.info("User {} has {} unread notifications", userId, count);
            return new ResponseDto(false, count);
        } catch (Exception e) {
            log.error("Error counting unread notifications for user {}: {}", userId, e.getMessage());
            return new ResponseDto(true, "Error counting unread notifications: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto markAsRead(String notificationId) {
        try {
            Optional<Notification> optionalNotification = notificationRepository.findById(notificationId);
            if (optionalNotification.isEmpty()) {
                return new ResponseDto(true, "Notification not found");
            }

            Notification notification = optionalNotification.get();
            notification.setRead(true);
            notificationRepository.save(notification);
            
            log.info("Marked notification {} as read", notificationId);
            return new ResponseDto(false, notification);
        } catch (Exception e) {
            log.error("Error marking notification {} as read: {}", notificationId, e.getMessage());
            return new ResponseDto(true, "Error marking notification as read: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto markAllAsRead(String userId) {
        try {
            List<Notification> unreadNotifications = notificationRepository.findByRecipientIdAndReadFalse(userId);
            
            for (Notification notification : unreadNotifications) {
                notification.setRead(true);
            }
            
            List<Notification> updatedNotifications = notificationRepository.saveAll(unreadNotifications);
            log.info("Marked all notifications as read for user {}", userId);
            return new ResponseDto(false, updatedNotifications);
        } catch (Exception e) {
            log.error("Error marking all notifications as read for user {}: {}", userId, e.getMessage());
            return new ResponseDto(true, "Error marking all notifications as read: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto deleteNotification(String notificationId, Authentication auth) {
        try {
            if (auth == null || !auth.isAuthenticated()) {
                return new ResponseDto(true, "Authentication required");
            }
            
            Optional<Notification> optionalNotification = notificationRepository.findById(notificationId);
            if (optionalNotification.isEmpty()) {
                return new ResponseDto(true, "Notification not found");
            }

            Notification notification = optionalNotification.get();
            
            // Get current user
            UserDetails userDetails = (UserDetails) auth.getPrincipal();
            User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            
            // Verify that the user owns this notification
            if (!notification.getRecipientId().equals(currentUser.getId())) {
                return new ResponseDto(true, "You are not authorized to delete this notification");
            }
            
            notificationRepository.delete(notification);
            log.info("Deleted notification {}", notificationId);
            return new ResponseDto(false, "Notification deleted successfully");
        } catch (Exception e) {
            log.error("Error deleting notification {}: {}", notificationId, e.getMessage());
            return new ResponseDto(true, "Error deleting notification: " + e.getMessage());
        }
    }
}