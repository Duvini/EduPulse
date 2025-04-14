package com.example.edupulse_backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document(collection = "skill_posts")
public class SkillPost {
    @Id
    private String id;
    private String userName; // To be replaced with userId when auth is ready
    private String profilePhotoUrl;
    private String description;
    private List<String> mediaUrls;
    private List<String> tags;
}
