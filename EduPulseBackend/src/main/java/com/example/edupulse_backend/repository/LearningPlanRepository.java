package com.example.edupulse_backend.repository;

import com.example.edupulse_backend.model.LearningPlan;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface LearningPlanRepository extends MongoRepository<LearningPlan, String>{
    List<LearningPlan> findByCreatorId(String creatorId);
}