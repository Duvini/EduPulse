package com.example.edupulse_backend.controller;

import com.example.edupulse_backend.payload.response.ResponseDto;
import com.example.edupulse_backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notifications")
@CrossOrigin
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;
    private final WebSocketNotificationController webSocketController;

    @GetMapping
    public ResponseEntity<ResponseDto> getNotifications(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            log.warn("Authentication is missing or invalid");
            return ResponseEntity.status(401).body(new ResponseDto(true, "Authentication required"));
        }
        
        // Extract user ID from authentication
        String userId = getUserIdFromAuth(authentication);
        if (userId == null) {
            return ResponseEntity.status(401).body(new ResponseDto(true, "Invalid authentication"));
        }
        
        ResponseDto response = notificationService.getNotifications(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/unread")
    public ResponseEntity<ResponseDto> getUnreadNotifications(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            log.warn("Authentication is missing or invalid");
            return ResponseEntity.status(401).body(new ResponseDto(true, "Authentication required"));
        }
        
        String userId = getUserIdFromAuth(authentication);
        if (userId == null) {
            return ResponseEntity.status(401).body(new ResponseDto(true, "Invalid authentication"));
        }
        
        ResponseDto response = notificationService.getUnreadNotifications(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/count")
    public ResponseEntity<ResponseDto> getUnreadCount(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            log.warn("Authentication is missing or invalid");
            return ResponseEntity.status(401).body(new ResponseDto(true, "Authentication required"));
        }
        
        String userId = getUserIdFromAuth(authentication);
        if (userId == null) {
            return ResponseEntity.status(401).body(new ResponseDto(true, "Invalid authentication"));
        }
        
        ResponseDto response = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/read/{notificationId}")
    public ResponseEntity<ResponseDto> markAsRead(
            @PathVariable String notificationId,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            log.warn("Authentication is missing or invalid");
            return ResponseEntity.status(401).body(new ResponseDto(true, "Authentication required"));
        }
        
        if (notificationId == null || notificationId.trim().isEmpty()) {
            log.warn("Invalid notification ID provided");
            return ResponseEntity.badRequest().body(new ResponseDto(true, "Notification ID cannot be empty"));
        }
        
        ResponseDto response = notificationService.markAsRead(notificationId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/read-all")
    public ResponseEntity<ResponseDto> markAllAsRead(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            log.warn("Authentication is missing or invalid");
            return ResponseEntity.status(401).body(new ResponseDto(true, "Authentication required"));
        }
        
        String userId = getUserIdFromAuth(authentication);
        if (userId == null) {
            return ResponseEntity.status(401).body(new ResponseDto(true, "Invalid authentication"));
        }
        
        ResponseDto response = notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/connected-users")
    public ResponseEntity<ResponseDto> getConnectedUsersCount(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(new ResponseDto(true, "Authentication required"));
        }
        
        int count = webSocketController.getConnectedUsersCount();
        return ResponseEntity.ok(new ResponseDto(false, count));
    }
    
    // Helper method to extract user ID from authentication
    private String getUserIdFromAuth(Authentication authentication) {
        try {
            // This would need to be adapted based on your authentication structure
            org.springframework.security.core.userdetails.UserDetails userDetails = 
                (org.springframework.security.core.userdetails.UserDetails) authentication.getPrincipal();
            
            // Get user from username
            return userDetails.getUsername();
            
            // In a real implementation, you would likely need to:
            // 1. Get the username from authentication
            // 2. Use a service to look up the user's ID by username
            // 3. Return the user's ID
        } catch (Exception e) {
            log.error("Error extracting user ID from authentication: {}", e.getMessage());
            return null;
        }
    }
}