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
@Document("likes")
public class Like {
    @Id
    private String id;
    private String postId;     // ID of the post being liked
    private String userId;     // ID of user who liked the post
    private String userName;   // Display name of the user
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "UTC")
    private LocalDateTime createdAt;
    
    // Custom constructor for convenience
    public Like(String postId, String userId, String userName) {
        this.postId = postId;
        this.userId = userId;
        this.userName = userName;
        this.createdAt = LocalDateTime.now();
    }
}