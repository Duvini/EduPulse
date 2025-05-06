package com.example.edupulse_backend.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Document("comments")
public class Comment {
    @Id
    private String id;
    private String postId;     // ID of the post being commented on
    private String userId;     // ID of user who made the comment
    private String userName;   // Display name
    private String content;    // Comment text
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private LocalDateTime updatedAt;
    
    // Custom constructor for convenience
    public Comment(String postId, String userId, String userName, String content) {
        this.postId = postId;
        this.userId = userId;
        this.userName = userName;
        this.content = content;
        this.createdAt = LocalDateTime.now(ZoneOffset.UTC);
        this.updatedAt = LocalDateTime.now(ZoneOffset.UTC);
    }
    
    // Update the updatedAt timestamp
    public void updateTimestamp() {
        this.updatedAt = LocalDateTime.now(ZoneOffset.UTC);
    }
    
    // Add PrePersist annotation equivalent for MongoDB
    @Builder.Default
    private boolean timestampsInitialized = false;
    
    // Method to ensure timestamps are set - explicitly using UTC
    public void ensureTimestamps() {
        if (!timestampsInitialized) {
            if (this.createdAt == null) {
                this.createdAt = LocalDateTime.now(ZoneOffset.UTC);
            }
            if (this.updatedAt == null) {
                this.updatedAt = LocalDateTime.now(ZoneOffset.UTC);
            }
            timestampsInitialized = true;
        }
    }
}