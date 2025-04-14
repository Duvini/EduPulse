package com.example.edupulse_backend.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Task{
    private String name;
    private List<String> resources;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate deadline;
    private boolean completed;
    
}
