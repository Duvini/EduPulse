package com.example.edupulse_backend.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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

    @NotBlank(message="Title is required")
    @Size(min=3,max=50, message = "Title must be within 3 and 50 characters")
    private String title;

    @NotBlank(message="Description is required")
    @Size(max=150, message = "Can't exceed 150 characters")
    private String description;

    @NotNull(message = "Tasks list cannot be null")
    @Size(min=1, message = "At least one task should be added")
    private List<Task> tasks;

    @CreatedDate
    private LocalDateTime createdAt;

}

