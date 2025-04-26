package com.example.edupulse_backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document("skill_posts")
public class SkillPost {
    @Id
    private String id;
    private String userId;
    private String userName;
    private String profilePhotoUrl;
    private String description;
    private List<String> mediaUrls;
    private List<String> tags;
}
