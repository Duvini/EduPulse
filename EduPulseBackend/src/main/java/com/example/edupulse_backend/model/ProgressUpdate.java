package com.example.edupulse_backend.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Document(collection = "Progress_updates")
@AllArgsConstructor
@NoArgsConstructor
public class ProgressUpdate {

    @Id
    private String id;

    private String userId;

    @NotBlank(message = "A template is required")
    private String template;

    @NotBlank(message = "Add some content")
    private String content;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate finishedAt;

    @CreatedDate
    private LocalDateTime createdAt;

}
