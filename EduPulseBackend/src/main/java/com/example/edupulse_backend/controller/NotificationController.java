package com.example.edupulse_backend.controller;

import com.example.edupulse_backend.model.Notification.NotificationType;
import com.example.edupulse_backend.payload.request.CustomNotificationRequest;
import com.example.edupulse_backend.payload.request.SystemNotificationRequest;
import com.example.edupulse_backend.payload.response.ResponseDto;
import com.example.edupulse_backend.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
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
    
    // New endpoints for creating and managing notifications
    
    @PostMapping("/custom")
    public ResponseEntity<ResponseDto> createCustomNotification(
            @Valid @RequestBody CustomNotificationRequest request,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            log.warn("Authentication is missing or invalid");
            return ResponseEntity.status(401).body(new ResponseDto(true, "Authentication required"));
        }
        
        String senderId = getUserIdFromAuth(authentication);
        if (senderId == null) {
            return ResponseEntity.status(401).body(new ResponseDto(true, "Invalid authentication"));
        }
        
        // If recipientId is not provided, default to self-notification
        String recipientId = request.getRecipientId();
        if (recipientId == null || recipientId.trim().isEmpty()) {
            recipientId = senderId; // Default to sending notification to self
            log.info("No recipientId provided, defaulting to self-notification");
        }
        
        if (request.getContent() == null || request.getContent().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new ResponseDto(true, "Notification content is required"));
        }
        
        ResponseDto response = notificationService.createCustomNotification(
                recipientId,
                senderId,
                request.getSenderName(),
                request.getType(),
                request.getContent(),
                request.getPostId(),
                request.getCommentId()
        );
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/system")
    public ResponseEntity<ResponseDto> createSystemNotification(
            @Valid @RequestBody SystemNotificationRequest request,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            log.warn("Authentication is missing or invalid");
            return ResponseEntity.status(401).body(new ResponseDto(true, "Authentication required"));
        }
        
        // For system notifications, might require admin role
        // This is where you'd check if user has admin privileges
        
        // If recipientId is not provided or is "all", send to all users
        String recipientId = request.getRecipientId();
        if (recipientId == null || recipientId.trim().isEmpty() || "all".equalsIgnoreCase(recipientId)) {
            // Send to all users (would need to be implemented in service)
            return ResponseEntity.ok(notificationService.createSystemNotificationForAllUsers(
                    request.getContent()
            ));
        }
        
        if (request.getContent() == null || request.getContent().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new ResponseDto(true, "Notification content is required"));
        }
        
        ResponseDto response = notificationService.createSystemNotification(
                recipientId,
                request.getContent()
        );
        
        return ResponseEntity.ok(response);
    }
    
    // New endpoint for creating notifications based on post activity
    @PostMapping("/post-activity")
    public ResponseEntity<ResponseDto> createPostActivityNotification(
            @RequestParam String postId,
            @RequestParam String action, // e.g., "like", "comment"
            @RequestParam(required = false) String commentId,
            @RequestParam(required = false) String content,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            log.warn("Authentication is missing or invalid");
            return ResponseEntity.status(401).body(new ResponseDto(true, "Authentication required"));
        }
        
        String senderId = getUserIdFromAuth(authentication);
        if (senderId == null) {
            return ResponseEntity.status(401).body(new ResponseDto(true, "Invalid authentication"));
        }
        
        // Let the service determine the recipient based on post owner
        ResponseDto response = notificationService.createPostActivityNotification(
                postId, 
                senderId, 
                action, 
                commentId, 
                content
        );
        
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<ResponseDto> deleteNotification(
            @PathVariable String notificationId,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            log.warn("Authentication is missing or invalid");
            return ResponseEntity.status(401).body(new ResponseDto(true, "Authentication required"));
        }
        
        // Additional validation or permission checks could be added here
        
        ResponseDto response = notificationService.deleteNotification(notificationId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/type/{type}")
    public ResponseEntity<ResponseDto> getNotificationsByType(
            @PathVariable String type,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            log.warn("Authentication is missing or invalid");
            return ResponseEntity.status(401).body(new ResponseDto(true, "Authentication required"));
        }
        
        String userId = getUserIdFromAuth(authentication);
        if (userId == null) {
            return ResponseEntity.status(401).body(new ResponseDto(true, "Invalid authentication"));
        }
        
        NotificationType notificationType;
        try {
            notificationType = NotificationType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ResponseDto(true, "Invalid notification type"));
        }
        
        ResponseDto response = notificationService.getNotificationsByType(userId, notificationType);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{notificationId}")
    public ResponseEntity<ResponseDto> getNotificationById(
            @PathVariable String notificationId,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            log.warn("Authentication is missing or invalid");
            return ResponseEntity.status(401).body(new ResponseDto(true, "Authentication required"));
        }
        
        String userId = getUserIdFromAuth(authentication);
        if (userId == null) {
            return ResponseEntity.status(401).body(new ResponseDto(true, "Invalid authentication"));
        }
        
        ResponseDto response = notificationService.getNotificationById(notificationId, userId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/paginated")
    public ResponseEntity<ResponseDto> getPaginatedNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String type,
            @RequestParam(required = false, defaultValue = "false") boolean unreadOnly,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            log.warn("Authentication is missing or invalid");
            return ResponseEntity.status(401).body(new ResponseDto(true, "Authentication required"));
        }
        
        String userId = getUserIdFromAuth(authentication);
        if (userId == null) {
            return ResponseEntity.status(401).body(new ResponseDto(true, "Invalid authentication"));
        }
        
        NotificationType notificationType = null;
        if (type != null && !type.trim().isEmpty()) {
            try {
                notificationType = NotificationType.valueOf(type.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(new ResponseDto(true, "Invalid notification type"));
            }
        }
        
        ResponseDto response = notificationService.getPaginatedNotifications(
                userId, page, size, notificationType, unreadOnly);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/latest")
    public ResponseEntity<ResponseDto> getLatestNotifications(
            @RequestParam(defaultValue = "5") int limit,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            log.warn("Authentication is missing or invalid");
            return ResponseEntity.status(401).body(new ResponseDto(true, "Authentication required"));
        }
        
        String userId = getUserIdFromAuth(authentication);
        if (userId == null) {
            return ResponseEntity.status(401).body(new ResponseDto(true, "Invalid authentication"));
        }
        
        ResponseDto response = notificationService.getLatestNotifications(userId, limit);
        return ResponseEntity.ok(response);
    }
    
    // Helper method to extract user ID from authentication
    private String getUserIdFromAuth(Authentication authentication) {
        try {
            if (authentication == null) {
                authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication == null) {
                    return null;
                }
            }
            
            Object principal = authentication.getPrincipal();
            
            if (principal instanceof UserDetails) {
                // If using UserDetails implementation
                return ((UserDetails) principal).getUsername();
            } else if (principal instanceof String) {
                // If using simple String username
                return (String) principal;
            }
            
            // If we can't determine the user ID, log the issue
            log.warn("Unable to extract user ID from authentication principal type: {}", 
                     principal != null ? principal.getClass().getName() : "null");
            return null;
        } catch (Exception e) {
            log.error("Error extracting user ID from authentication: {}", e.getMessage());
            return null;
        }
    }
}