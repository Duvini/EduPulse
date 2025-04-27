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
}