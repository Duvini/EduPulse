package com.example.edupulse_backend.service;

import com.example.edupulse_backend.model.LearningPlan;
import com.example.edupulse_backend.model.Task;
import com.example.edupulse_backend.payload.response.ResponseDto;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface LearningPlanService {

    ResponseDto createLearningPlan(Authentication auth, LearningPlan learningPlan);

    LearningPlan getLearningPlan(String planId);

    ResponseDto getAllLearningPlans();

    ResponseDto updateLearningPLan(String planId, LearningPlan plan, Authentication auth );

    ResponseDto deleteLearningPlan(String planId, Authentication auth);

    ResponseDto updateTaskStatus(String planId, int taskIndex, boolean isCompleted, Authentication auth);

    ResponseDto getLearningPlanOfUser(String userId);
}