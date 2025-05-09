package com.example.edupulse_backend.controller;

import com.example.edupulse_backend.model.Notification;
import com.example.edupulse_backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Controller
@Slf4j
@RequiredArgsConstructor
public class WebSocketNotificationController {
    
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationRepository notificationRepository;
    
    // Track connected users
    private final Map<String, Boolean> connectedUsers = new ConcurrentHashMap<>();
    
    /**
     * Send a notification to a specific user
     * 
     * @param userId the ID of the user to send the notification to
     * @param notification the notification to send
     */
    public void sendNotification(String userId, Notification notification) {
        log.debug("Sending notification to user: {}", userId);
        messagingTemplate.convertAndSendToUser(
                userId,
                "/queue/notifications",
                notification
        );
    }
    
    /**
     * Send the updated unread notification count to a specific user
     * 
     * @param userId the ID of the user to send the count to
     */
    public void sendUnreadCount(String userId) {
        log.debug("Sending unread count to user: {}", userId);
        long unreadCount = notificationRepository.countByRecipientIdAndRead(userId, false);
        messagingTemplate.convertAndSendToUser(
                userId,
                "/queue/notifications/count",
                unreadCount
        );
    }
    
    /**
     * Check if a user is connected via WebSocket
     * 
     * @param userId the ID of the user to check
     * @return true if the user is connected, false otherwise
     */
    public boolean isUserConnected(String userId) {
        return connectedUsers.getOrDefault(userId, false);
    }
    
    /**
     * Mark a user as connected
     * 
     * @param userId the ID of the user to mark as connected
     */
    public void userConnected(String userId) {
        connectedUsers.put(userId, true);
        log.info("User connected: {}", userId);
    }
    
    /**
     * Mark a user as disconnected
     * 
     * @param userId the ID of the user to mark as disconnected
     */
    public void userDisconnected(String userId) {
        connectedUsers.remove(userId);
        log.info("User disconnected: {}", userId);
    }
    
    /**
     * Get the count of currently connected users
     * 
     * @return the number of connected users
     */
    public int getConnectedUsersCount() {
        return connectedUsers.size();
    }
}