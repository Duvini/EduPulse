package com.example.edupulse_backend.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
@Slf4j
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final WebSocketNotificationController webSocketController;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        SimpMessageHeaderAccessor headers = SimpMessageHeaderAccessor.wrap(event.getMessage());
        String userId = getUserId(headers);
        if (userId != null) {
            log.info("User connected: {}", userId);
            webSocketController.userConnected(userId);
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        SimpMessageHeaderAccessor headers = SimpMessageHeaderAccessor.wrap(event.getMessage());
        String userId = getUserId(headers);
        if (userId != null) {
            log.info("User disconnected: {}", userId);
            webSocketController.userDisconnected(userId);
        }
    }

    private String getUserId(SimpMessageHeaderAccessor headers) {
        // In a real application, we would extract the user ID from the authentication
        // For now, we can use a simple user ID from the headers
        if (headers != null && headers.getUser() != null) {
            return headers.getUser().getName();
        }
        return null;
    }
}