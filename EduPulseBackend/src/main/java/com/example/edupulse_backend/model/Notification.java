package com.example.edupulse_backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Document("notifications")
public class Notification {
    @Id
    private String id;
    
    private String recipientId;    // User who will receive the notification
    private String senderId;       // User who triggered the notification
    private String senderName;     // Name of the sender
    
    private String postId;         // Related post ID (if applicable)
    private String commentId;      // Related comment ID (if applicable)
    
    private NotificationType type;  // Type of notification
    private String content;         // Notification message
    private boolean read;           // Whether notification has been read
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "UTC")
    private LocalDateTime createdAt;
    
    // Enum for notification types
    public enum NotificationType {
        LIKE,
        COMMENT,
        REPLY,
        MENTION,
        SYSTEM
    }
}