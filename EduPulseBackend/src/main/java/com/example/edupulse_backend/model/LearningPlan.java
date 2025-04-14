package com.example.edupulse_backend.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "learning_plans")
@AllArgsConstructor
@NoArgsConstructor
public class LearningPlan {
    @Id
    private String id;
    private String creatorId;
    private String title;
    private String description;
    private List<Task> tasks;
    @CreatedDate
    private LocalDateTime createdAt;

}

