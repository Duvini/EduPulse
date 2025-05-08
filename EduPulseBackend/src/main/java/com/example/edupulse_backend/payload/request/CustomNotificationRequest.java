package com.example.edupulse_backend.payload.request;

import com.example.edupulse_backend.model.Notification.NotificationType;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomNotificationRequest {
    
    // Optional: If not provided, will default to the authenticated user
    private String recipientId;
    
    // Optional: If not provided, will use the authenticated user's name
    private String senderName;
    
    // Required: The type of notification
    private NotificationType type = NotificationType.SYSTEM;
    
    // Required: The notification message
    @NotBlank(message = "Notification content is required")
    private String content;
    
    // Optional: Reference to a post (if notification is related to a post)
    private String postId;
    
    // Optional: Reference to a comment (if notification is related to a comment)
    private String commentId;
}