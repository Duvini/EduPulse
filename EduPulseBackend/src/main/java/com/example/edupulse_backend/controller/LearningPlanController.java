package com.example.edupulse_backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class LearningPlanController {

    @GetMapping
    public String getLearningPlan() {
        return "Learning Plan";
    }
}
