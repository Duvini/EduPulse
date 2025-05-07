package com.example.edupulse_backend.config;

import com.example.edupulse_backend.controller.WebSocketNotificationController;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {
    
    private final WebSocketNotificationController webSocketController;
    
    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        log.debug("Received a new web socket connection: {}", 
                 headerAccessor.getSessionId());
    }
    
    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        
        // Extract user ID from session
        String userId = null;
        if (headerAccessor.getSessionAttributes() != null) {
            userId = (String) headerAccessor.getSessionAttributes().get("USER_ID");
        }
        
        if (userId != null) {
            log.info("User disconnected from WebSocket: {} (Session: {})", 
                    userId, headerAccessor.getSessionId());
            webSocketController.handleDisconnect(userId);
        } else {
            log.debug("Session disconnected without userId: {}", 
                     headerAccessor.getSessionId());
        }
    }
}