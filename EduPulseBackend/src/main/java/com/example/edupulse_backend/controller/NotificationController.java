package com.example.edupulse_backend.controller;

import com.example.edupulse_backend.model.Notification;
import com.example.edupulse_backend.payload.response.ResponseDto;
import com.example.edupulse_backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
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

    @GetMapping("/user/{userId}")
    public ResponseEntity<ResponseDto> getNotificationsByUser(@PathVariable String userId) {
        log.info("Request to get notifications for user: {}", userId);
        ResponseDto response = notificationService.getNotifications(userId);
        
        if (response.isError()) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/unread/{userId}")
    public ResponseEntity<ResponseDto> getUnreadNotifications(@PathVariable String userId) {
        log.info("Request to get unread notifications for user: {}", userId);
        ResponseDto response = notificationService.getUnreadNotifications(userId);
        
        if (response.isError()) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/count/{userId}")
    public ResponseEntity<ResponseDto> getUnreadCount(@PathVariable String userId) {
        log.info("Request to get unread notification count for user: {}", userId);
        ResponseDto response = notificationService.getUnreadCount(userId);
        
        if (response.isError()) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    @PutMapping("/read/{notificationId}")
    public ResponseEntity<ResponseDto> markAsRead(@PathVariable String notificationId) {
        log.info("Request to mark notification as read: {}", notificationId);
        ResponseDto response = notificationService.markAsRead(notificationId);
        
        if (response.isError()) {
            String message = response.getMessage();
            if (message != null && message.contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    @PutMapping("/read-all/{userId}")
    public ResponseEntity<ResponseDto> markAllAsRead(@PathVariable String userId) {
        log.info("Request to mark all notifications as read for user: {}", userId);
        ResponseDto response = notificationService.markAllAsRead(userId);
        
        if (response.isError()) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<ResponseDto> deleteNotification(
        @PathVariable String notificationId,
        Authentication authentication
    ) {
        log.info("Request to delete notification: {}", notificationId);
        ResponseDto response = notificationService.deleteNotification(notificationId, authentication);
        
        if (response.isError()) {
            String message = response.getMessage();
            if (message != null && message.contains("not found")) {
                return ResponseEntity.notFound().build();
            } else if (message != null && message.contains("not authorized")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }
}