<<<<<<< HEAD
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
=======
package com.example.edupulse_backend.controller;

import com.example.edupulse_backend.payload.response.ResponseDto;
import com.example.edupulse_backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/{userId}")
    public ResponseDto getNotifications(@PathVariable String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            log.warn("Invalid user ID provided");
            return new ResponseDto(true, "User ID cannot be empty");
        }
        return notificationService.getNotifications(userId);
    }

    @GetMapping("/unread/{userId}")
    public ResponseDto getUnreadNotifications(@PathVariable String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            log.warn("Invalid user ID provided");
            return new ResponseDto(true, "User ID cannot be empty");
        }
        return notificationService.getUnreadNotifications(userId);
    }

    @GetMapping("/count/{userId}")
    public ResponseDto getUnreadCount(@PathVariable String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            log.warn("Invalid user ID provided");
            return new ResponseDto(true, "User ID cannot be empty");
        }
        return notificationService.getUnreadCount(userId);
    }

    @PutMapping("/read/{notificationId}")
    public ResponseDto markAsRead(@PathVariable String notificationId) {
        if (notificationId == null || notificationId.trim().isEmpty()) {
            log.warn("Invalid notification ID provided");
            return new ResponseDto(true, "Notification ID cannot be empty");
        }
        return notificationService.markAsRead(notificationId);
    }

    @PutMapping("/read-all/{userId}")
    public ResponseDto markAllAsRead(@PathVariable String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            log.warn("Invalid user ID provided");
            return new ResponseDto(true, "User ID cannot be empty");
        }
        return notificationService.markAllAsRead(userId);
    }
    
    @GetMapping("/today/{userId}")
    public ResponseDto getTodayNotifications(@PathVariable String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            log.warn("Invalid user ID provided");
            return new ResponseDto(true, "User ID cannot be empty");
        }
        return notificationService.getTodayNotifications(userId);
    }
    
    @GetMapping("/yesterday/{userId}")
    public ResponseDto getYesterdayNotifications(@PathVariable String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            log.warn("Invalid user ID provided");
            return new ResponseDto(true, "User ID cannot be empty");
        }
        return notificationService.getYesterdayNotifications(userId);
    }
    
    @GetMapping("/last-week/{userId}")
    public ResponseDto getLastWeekNotifications(@PathVariable String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            log.warn("Invalid user ID provided");
            return new ResponseDto(true, "User ID cannot be empty");
        }
        return notificationService.getLastWeekNotifications(userId);
    }
    
    @GetMapping("/last-two-weeks/{userId}")
    public ResponseDto getLastTwoWeeksNotifications(@PathVariable String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            log.warn("Invalid user ID provided");
            return new ResponseDto(true, "User ID cannot be empty");
        }
        return notificationService.getLastTwoWeeksNotifications(userId);
    }
    
    @GetMapping("/last-month/{userId}")
    public ResponseDto getLastMonthNotifications(@PathVariable String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            log.warn("Invalid user ID provided");
            return new ResponseDto(true, "User ID cannot be empty");
        }
        return notificationService.getLastMonthNotifications(userId);
    }
    
    // For custom date ranges
    @GetMapping("/date-range/{userId}")
    public ResponseDto getNotificationsByDateRange(
            @PathVariable String userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        if (userId == null || userId.trim().isEmpty()) {
            log.warn("Invalid user ID provided");
            return new ResponseDto(true, "User ID cannot be empty");
        }
        
        if (startDate == null || endDate == null) {
            log.warn("Invalid date range provided");
            return new ResponseDto(true, "Start date and end date must be provided");
        }
        
        if (startDate.isAfter(endDate)) {
            log.warn("Invalid date range: start date is after end date");
            return new ResponseDto(true, "Start date cannot be after end date");
        }
        
        return notificationService.getNotificationsByTimeRange(userId, startDate, endDate);
    }
>>>>>>> 47a8b707de7c1b39b0a56824c1f1f28778a6d1dc
}