package com.example.edupulse_backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "media")
public class Media {
    @Id
    private String id;
    
    private String fileName;
    private String contentType;
    private byte[] content;
    private Long fileSize;
    private String mediaType; // "image" or "video"
    private String relatedEntity; // e.g., "profile", "post"
    private String relatedEntityId; // user ID or post ID
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}