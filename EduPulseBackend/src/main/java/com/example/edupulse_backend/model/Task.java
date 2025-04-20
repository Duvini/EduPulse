package com.example.edupulse_backend.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Task{

    @NotBlank(message="Task name is required")
    @Size(max=50, message = "Task name cannot exceed 50 characters")
    private String name;

    private List<String> resources;

    @FutureOrPresent(message="Deadline should be today or a future date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate deadline;

    private boolean completed;
    
}
