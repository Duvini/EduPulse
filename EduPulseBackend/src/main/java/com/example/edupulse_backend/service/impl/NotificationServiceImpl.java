package com.example.edupulse_backend.service.impl;

import com.example.edupulse_backend.model.Notification;
import com.example.edupulse_backend.payload.response.ResponseDto;
import com.example.edupulse_backend.repository.NotificationRepository;
import com.example.edupulse_backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate; // For WebSocket communication

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
    public ResponseDto markAsRead(String notificationId) {
        log.info("Marking notification as read: {}", notificationId);
        Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
        
        if (notificationOpt.isPresent()) {
            Notification notification = notificationOpt.get();
            notification.setRead(true);
            notificationRepository.save(notification);
            
            // Send updated unread count via WebSocket
            sendUnreadCountUpdate(notification.getRecipientId());
            
            return new ResponseDto(false, "Notification marked as read");
        }
        
        return new ResponseDto(true, "Notification not found");
    }

    @Override
    public ResponseDto markAllAsRead(String userId) {
        log.info("Marking all notifications as read for user: {}", userId);
        
        // Better approach - bulk update
        List<Notification> notifications = notificationRepository.findByRecipientIdAndReadOrderByCreatedAtDesc(userId, false);
        if (!notifications.isEmpty()) {
            notifications.forEach(notification -> notification.setRead(true));
            notificationRepository.saveAll(notifications);
            
            // Send updated unread count via WebSocket
            sendUnreadCountUpdate(userId);
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
    public ResponseDto getNotificationsByTimeRange(String userId, LocalDateTime startDateTime, LocalDateTime endDateTime) {
        if (!StringUtils.hasText(userId)) {
            log.error("Invalid user ID: null or empty");
            return new ResponseDto(true, "User ID cannot be null or empty");
        }
        
        if (startDateTime == null || endDateTime == null) {
            log.error("Invalid date range: start or end date is null");
            return new ResponseDto(true, "Start date and end date cannot be null");
        }
        
        if (startDateTime.isAfter(endDateTime)) {
            log.error("Invalid date range: start date is after end date");
            return new ResponseDto(true, "Start date cannot be after end date");
        }
        
        log.info("Getting notifications for user: {} between {} and {}", userId, startDateTime, endDateTime);
        List<Notification> notifications = notificationRepository.findByRecipientIdAndCreatedAtBetweenOrderByCreatedAtDesc(
                userId, startDateTime, endDateTime);
        return new ResponseDto(false, notifications);
    }

    @Override
    public ResponseDto getTodayNotifications(String userId) {
        if (!StringUtils.hasText(userId)) {
            log.error("Invalid user ID: null or empty");
            return new ResponseDto(true, "User ID cannot be null or empty");
        }
        
        LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59);
        
        log.info("Getting today's notifications for user: {}", userId);
        return getNotificationsByTimeRange(userId, startOfDay, endOfDay);
    }

    @Override
    public ResponseDto getYesterdayNotifications(String userId) {
        if (!StringUtils.hasText(userId)) {
            log.error("Invalid user ID: null or empty");
            return new ResponseDto(true, "User ID cannot be null or empty");
        }
        
        LocalDateTime startOfYesterday = LocalDateTime.now().minusDays(1).toLocalDate().atStartOfDay();
        LocalDateTime endOfYesterday = LocalDateTime.now().minusDays(1).toLocalDate().atTime(23, 59, 59);
        
        log.info("Getting yesterday's notifications for user: {}", userId);
        return getNotificationsByTimeRange(userId, startOfYesterday, endOfYesterday);
    }

    @Override
    public ResponseDto getLastWeekNotifications(String userId) {
        if (!StringUtils.hasText(userId)) {
            log.error("Invalid user ID: null or empty");
            return new ResponseDto(true, "User ID cannot be null or empty");
        }
        
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7).toLocalDate().atStartOfDay();
        LocalDateTime now = LocalDateTime.now();
        
        log.info("Getting last week's notifications for user: {}", userId);
        return getNotificationsByTimeRange(userId, sevenDaysAgo, now);
    }

    @Override
    public ResponseDto getLastTwoWeeksNotifications(String userId) {
        if (!StringUtils.hasText(userId)) {
            log.error("Invalid user ID: null or empty");
            return new ResponseDto(true, "User ID cannot be null or empty");
        }
        
        LocalDateTime fourteenDaysAgo = LocalDateTime.now().minusDays(14).toLocalDate().atStartOfDay();
        LocalDateTime now = LocalDateTime.now();
        
        log.info("Getting last two weeks' notifications for user: {}", userId);
        return getNotificationsByTimeRange(userId, fourteenDaysAgo, now);
    }

    @Override
    public ResponseDto getLastMonthNotifications(String userId) {
        if (!StringUtils.hasText(userId)) {
            log.error("Invalid user ID: null or empty");
            return new ResponseDto(true, "User ID cannot be null or empty");
        }
        
        LocalDateTime oneMonthAgo = LocalDateTime.now().minusMonths(1).toLocalDate().atStartOfDay();
        LocalDateTime now = LocalDateTime.now();
        
        log.info("Getting last month's notifications for user: {}", userId);
        return getNotificationsByTimeRange(userId, oneMonthAgo, now);
    }

    @Override
    public void createLikeNotification(String postId, String likerId, String likerName, String postOwnerId) {
        // Don't notify if user likes their own post
        if (likerId.equals(postOwnerId)) {
            return;
        }
        
        log.info("Creating like notification: {} liked a post by {}", likerId, postOwnerId);
        
        // Check if similar notification exists recently to prevent spam
        List<Notification> recentNotifications = notificationRepository.findByRecipientIdAndSenderIdAndTypeAndCreatedAtAfter(
                postOwnerId, likerId, Notification.NotificationType.LIKE, 
                LocalDateTime.now().minusMinutes(5)); // Check last 5 minutes
                
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
                .createdAt(LocalDateTime.now())
                .build();
        
        notification = notificationRepository.save(notification);
        
        // Send real-time notification via WebSocket
        messagingTemplate.convertAndSendToUser(
                postOwnerId,
                "/queue/notifications",
                notification
        );
        
        // Also send updated count
        sendUnreadCountUpdate(postOwnerId);
    }

    @Override
    public void createCommentNotification(String postId, String commentId, String commenterId, String commenterName, String postOwnerId) {
        // Don't notify if user comments on their own post
        if (commenterId.equals(postOwnerId)) {
            return;
        }
        
        log.info("Creating comment notification: {} commented on a post by {}", commenterId, postOwnerId);
        
        // Check if similar notification exists recently to prevent spam
        List<Notification> recentNotifications = notificationRepository.findByRecipientIdAndSenderIdAndTypeAndCreatedAtAfter(
                postOwnerId, commenterId, Notification.NotificationType.COMMENT, 
                LocalDateTime.now().minusMinutes(2)); // Check last 2 minutes
                
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
                .createdAt(LocalDateTime.now())
                .build();
        
        notification = notificationRepository.save(notification);
        
        // Send real-time notification via WebSocket
        messagingTemplate.convertAndSendToUser(
                postOwnerId,
                "/queue/notifications",
                notification
        );
        
        // Also send updated count
        sendUnreadCountUpdate(postOwnerId);
    }
    
    // Helper method to send unread count updates
    private void sendUnreadCountUpdate(String userId) {
        long unreadCount = notificationRepository.countByRecipientIdAndRead(userId, false);
        Map<String, Object> countUpdate = new HashMap<>();
        countUpdate.put("unreadCount", unreadCount);
        
        messagingTemplate.convertAndSendToUser(
                userId,
                "/queue/notifications/count",
                countUpdate
        );
    }
}