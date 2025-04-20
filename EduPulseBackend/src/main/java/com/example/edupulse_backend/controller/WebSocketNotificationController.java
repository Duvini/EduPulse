package com.example.edupulse_backend.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Controller
@Slf4j
public class WebSocketNotificationController {

    private final SimpMessagingTemplate messagingTemplate;
    private final Map<String, Boolean> connectedUsers = new ConcurrentHashMap<>();

    public WebSocketNotificationController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/notifications.connect")
    public void connect(@Payload String userId) {
        log.info("User connected to notifications: {}", userId);
        connectedUsers.put(userId, true);
        
        // Using messagingTemplate to send a confirmation to the user
        messagingTemplate.convertAndSendToUser(
            userId, 
            "/queue/notifications", 
            Map.of("type", "CONNECTION_CONFIRMED", "message", "Successfully connected to notification service")
        );
    }
    
    @MessageMapping("/notifications.disconnect")
    public void disconnect(@Payload String userId) {
        log.info("User disconnected from notifications: {}", userId);
        connectedUsers.remove(userId);
    }
    
    // You could add a method to check if a user is connected
    public boolean isUserConnected(String userId) {
        return connectedUsers.containsKey(userId);
    }
    
    // Add a method to send notifications programmatically
    public void sendNotification(String userId, Object notification) {
        if (isUserConnected(userId)) {
            messagingTemplate.convertAndSendToUser(
                userId,
                "/queue/notifications",
                notification
            );
            log.debug("Notification sent to user: {}", userId);
        } else {
            log.debug("User not connected, notification not sent: {}", userId);
        }
    }
}