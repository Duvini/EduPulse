package com.example.edupulse_backend.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

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
    private String userName;   // Display name
    private String content;    // Comment text
    
    @JsonFormat(pattern = "yyyy-MM-dd' 'HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd' 'HH:mm:ss")
    private LocalDateTime updatedAt;
    
    // Custom constructor for convenience
    public Comment(String postId, String userName, String content) {
        this.postId = postId;
        this.userName = userName;
        this.content = content;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // Update the updatedAt timestamp
    public void updateTimestamp() {
        this.updatedAt = LocalDateTime.now();
    }
}