package com.example.edupulse_backend.payload.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SystemNotificationRequest {
    
    // Optional: If null or "all", notification will be sent to all users
    private String recipientId;
    
    // Required: The notification message
    @NotBlank(message = "Notification content is required")
    private String content;
}