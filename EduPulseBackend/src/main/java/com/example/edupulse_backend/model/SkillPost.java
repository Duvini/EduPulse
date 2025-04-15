package com.example.edupulse_backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Document("skill_posts")
public class SkillPost {
    @Id
    private String id;
    private String userId;
    private String profilePhotoUrl;
    private String description;
    private List<String> mediaUrls;
    private List<String> tags;
}
