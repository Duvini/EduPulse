package com.example.edupulse_backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "notifications")
public class Notification {
    
    @Id
    private String id;
    
    // Recipient of the notification
    private String recipientId;
    
    // If the notification is from a user (null for system notifications)
    private String senderId;
    private String senderName;
    
    // Related content IDs
    private String postId;
    private String commentId;
    
    // Notification content
    private String content;
    
    // Type of notification
    private NotificationType type;
    
    // Read status
    private boolean read;
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
    
    public enum NotificationType {
        LIKE,
        COMMENT,
        FOLLOW,
        SYSTEM,
        REPLY,
        MENTION
    }
}