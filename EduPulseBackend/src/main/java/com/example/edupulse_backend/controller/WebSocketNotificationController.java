package com.example.edupulse_backend.controller;

import com.example.edupulse_backend.model.Notification;
import com.example.edupulse_backend.repository.NotificationRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Controller
@Slf4j
public class WebSocketNotificationController {

    private final SimpMessagingTemplate messagingTemplate;
    // Use ConcurrentHashMap for thread safety
    private final Map<String, String> connectedUsers = new ConcurrentHashMap<>();
    private final NotificationRepository notificationRepository;
    
    // Constructor with @Lazy injection to avoid circular dependency
    public WebSocketNotificationController(
            SimpMessagingTemplate messagingTemplate, 
            @Lazy NotificationRepository notificationRepository) {
        this.messagingTemplate = messagingTemplate;
        this.notificationRepository = notificationRepository;
    }

    @MessageMapping("/notifications.connect")
    public void connect(@Payload Map<String, String> payload, SimpMessageHeaderAccessor headerAccessor) {
        String userId = payload.get("userId");
        String sessionId = headerAccessor != null ? headerAccessor.getSessionId() : null;
        
        if (userId == null || userId.isEmpty() || sessionId == null) {
            log.warn("Received connect message without valid userId or sessionId");
            return;
        }
        
        log.info("User connected to notifications: {} (Session: {})", userId, sessionId);
        connectedUsers.put(userId, sessionId);
        
        // Store userId in the WebSocket session for later use on disconnect
        if (headerAccessor.getSessionAttributes() != null) {
            headerAccessor.getSessionAttributes().put("USER_ID", userId);
        }
        
        // Send connection confirmation
        messagingTemplate.convertAndSendToUser(
            userId, 
            "/queue/notifications", 
            Map.of("type", "CONNECTION_CONFIRMED", "message", "Successfully connected to notification service")
        );
        
        // Send unread count immediately after connection
        sendUnreadCount(userId);
    }
    
    @MessageMapping("/notifications.disconnect")
    public void manualDisconnect(@Payload Map<String, String> payload) {
        String userId = payload.get("userId");
        if (userId == null || userId.isEmpty()) {
            log.warn("Received disconnect message without valid userId");
            return;
        }
        
        handleDisconnect(userId);
    }
    
    // Public method for SessionDisconnectEvent handler in WebSocketEventListener
    public void handleDisconnect(String userId) {
        if (userId != null) {
            log.info("User disconnected from notifications: {}", userId);
            connectedUsers.remove(userId);
        }
    }
    
    // Check if a user is connected
    public boolean isUserConnected(String userId) {
        return connectedUsers.containsKey(userId);
    }
    
    // Get connected users count (for monitoring)
    public int getConnectedUsersCount() {
        return connectedUsers.size();
    }
    
    // Send a notification programmatically
    public void sendNotification(String userId, Object notification) {
        if (isUserConnected(userId)) {
            try {
                messagingTemplate.convertAndSendToUser(
                    userId,
                    "/queue/notifications",
                    notification
                );
                log.debug("Notification sent to user: {}", userId);
            } catch (Exception e) {
                log.error("Error sending notification to user {}: {}", userId, e.getMessage());
            }
        } else {
            log.debug("User not connected, notification not sent: {}", userId);
        }
    }
    
    // Send unread count
    public void sendUnreadCount(String userId) {
        if (isUserConnected(userId)) {
            try {
                // Get count directly from repository to avoid circular dependency
                long unreadCount = notificationRepository.countByRecipientIdAndRead(userId, false);
                
                Map<String, Object> countUpdate = Map.of(
                    "type", "UNREAD_COUNT_UPDATE",
                    "unreadCount", unreadCount
                );
                
                messagingTemplate.convertAndSendToUser(
                    userId,
                    "/queue/notifications/count",
                    countUpdate
                );
                log.debug("Unread count update sent to user: {}", userId);
            } catch (Exception e) {
                log.error("Error sending unread count to user {}: {}", userId, e.getMessage());
            }
        }
    }
}