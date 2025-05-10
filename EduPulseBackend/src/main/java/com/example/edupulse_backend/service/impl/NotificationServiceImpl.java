package com.example.edupulse_backend.service.impl;

import com.example.edupulse_backend.model.Notification;
import com.example.edupulse_backend.payload.response.ResponseDto;
import com.example.edupulse_backend.repository.NotificationRepository;
import com.example.edupulse_backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    
    // Map to track active pollers by user ID and their wait objects
    private final Map<String, Set<NotificationPoller>> activePollers = new ConcurrentHashMap<>();
    
    // Polling timeout in milliseconds (30 seconds)
    private static final int POLLING_TIMEOUT = 30000;

    @Override
    public ResponseDto getNotifications(String userId) {
        try {
            List<Notification> notifications = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);
            return new ResponseDto(false, notifications);
        } catch (Exception e) {
            log.error("Error fetching notifications for user {}: {}", userId, e.getMessage());
            return new ResponseDto(true, "Error fetching notifications: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto getUnreadNotifications(String userId) {
        try {
            List<Notification> notifications = notificationRepository.findByRecipientIdAndReadOrderByCreatedAtDesc(userId, false);
            return new ResponseDto(false, notifications);
        } catch (Exception e) {
            log.error("Error fetching unread notifications for user {}: {}", userId, e.getMessage());
            return new ResponseDto(true, "Error fetching unread notifications: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto getUnreadCount(String userId) {
        try {
            long count = notificationRepository.countByRecipientIdAndRead(userId, false);
            Map<String, Object> result = new HashMap<>();
            result.put("count", count);
            return new ResponseDto(false, result);
        } catch (Exception e) {
            log.error("Error getting unread notification count for user {}: {}", userId, e.getMessage());
            return new ResponseDto(true, "Error getting unread notification count: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto markAsRead(String notificationId) {
        try {
            Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
            if (notificationOpt.isPresent()) {
                Notification notification = notificationOpt.get();
                notification.setRead(true);
                notificationRepository.save(notification);
                return new ResponseDto(false, "Notification marked as read");
            } else {
                return new ResponseDto(true, "Notification not found");
            }
        } catch (Exception e) {
            log.error("Error marking notification as read {}: {}", notificationId, e.getMessage());
            return new ResponseDto(true, "Error marking notification as read: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto markAllAsRead(String userId) {
        try {
            List<Notification> unreadNotifications = notificationRepository.findByRecipientIdAndReadOrderByCreatedAtDesc(userId, false);
            for (Notification notification : unreadNotifications) {
                notification.setRead(true);
            }
            notificationRepository.saveAll(unreadNotifications);
            return new ResponseDto(false, "All notifications marked as read");
        } catch (Exception e) {
            log.error("Error marking all notifications as read for user {}: {}", userId, e.getMessage());
            return new ResponseDto(true, "Error marking all notifications as read: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto pollNotifications(String userId, Long lastPolledTimestamp) {
        try {
            // Convert timestamp to LocalDateTime
            LocalDateTime lastPollTime = LocalDateTime.ofInstant(
                    Instant.ofEpochMilli(lastPolledTimestamp), 
                    ZoneId.systemDefault());
            
            // Check for new notifications immediately
            List<Notification> newNotifications = notificationRepository.findByRecipientIdAndCreatedAtAfterOrderByCreatedAtAsc(
                    userId, lastPollTime);
            
            if (!newNotifications.isEmpty()) {
                // Notifications are available immediately, return them
                return new ResponseDto(false, newNotifications);
            }
            
            // No immediate notifications, set up long polling
            NotificationPoller poller = new NotificationPoller();
            
            // Register poller for this user
            activePollers.computeIfAbsent(userId, k -> ConcurrentHashMap.newKeySet()).add(poller);
            
            try {
                // Wait for notification or timeout
                synchronized (poller) {
                    poller.wait(POLLING_TIMEOUT);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.warn("Polling interrupted for user {}", userId);
            } finally {
                // Remove poller when done
                Set<NotificationPoller> userPollers = activePollers.get(userId);
                if (userPollers != null) {
                    userPollers.remove(poller);
                    if (userPollers.isEmpty()) {
                        activePollers.remove(userId);
                    }
                }
            }
            
            // Check again after wait (either got a notification or timed out)
            newNotifications = notificationRepository.findByRecipientIdAndCreatedAtAfterOrderByCreatedAtAsc(
                    userId, lastPollTime);
            
            Map<String, Object> response = new HashMap<>();
            response.put("notifications", newNotifications);
            response.put("timestamp", System.currentTimeMillis());
            
            return new ResponseDto(false, response);
            
        } catch (Exception e) {
            log.error("Error during notification polling for user {}: {}", userId, e.getMessage());
            return new ResponseDto(true, "Error during notification polling: " + e.getMessage());
        }
    }

    @Override
    public Notification createNotification(String recipientId, String senderId, String senderName,
                                         Notification.NotificationType type, String content) {
        return createDetailedNotification(recipientId, senderId, senderName, null, null, type, content);
    }

    @Override
    public Notification createDetailedNotification(String recipientId, String senderId, String senderName,
                                          String postId, String commentId,
                                          Notification.NotificationType type, String content) {
        try {
            // Create notification
            Notification notification = Notification.builder()
                    .recipientId(recipientId)
                    .senderId(senderId)
                    .senderName(senderName)
                    .postId(postId)
                    .commentId(commentId)
                    .type(type)
                    .content(content)
                    .read(false)
                    .createdAt(LocalDateTime.now())
                    .build();
            
            // Save to database
            Notification savedNotification = notificationRepository.save(notification);
            
            // Notify any active pollers for this user
            notifyActivePollers(recipientId);
            
            return savedNotification;
        } catch (Exception e) {
            log.error("Error creating notification for user {}: {}", recipientId, e.getMessage());
            throw new RuntimeException("Failed to create notification", e);
        }
    }
    
    /**
     * Notifies all active pollers for a specific user
     */
    @Async
    protected void notifyActivePollers(String userId) {
        Set<NotificationPoller> pollers = activePollers.get(userId);
        if (pollers != null && !pollers.isEmpty()) {
            for (NotificationPoller poller : pollers) {
                synchronized (poller) {
                    poller.notify();
                }
            }
            log.debug("Notified {} active pollers for user {}", pollers.size(), userId);
        }
    }
    
    /**
     * Simple class to act as a wait/notify object for long polling
     */
    private static class NotificationPoller {
        // This is just a marker class to use as a monitor for wait/notify
    }
}