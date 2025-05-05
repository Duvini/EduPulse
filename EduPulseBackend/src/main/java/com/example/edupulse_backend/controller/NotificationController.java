package com.example.edupulse_backend.controller;

import com.example.edupulse_backend.payload.response.ResponseDto;
import com.example.edupulse_backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

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
}