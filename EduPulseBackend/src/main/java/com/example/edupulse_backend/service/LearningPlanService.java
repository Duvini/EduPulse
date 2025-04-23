package com.example.edupulse_backend.service;

import com.example.edupulse_backend.model.LearningPlan;
import com.example.edupulse_backend.payload.response.ResponseDto;

public interface LearningPlanService {

    ResponseDto createLearningPlan(LearningPlan learningPlan);

    LearningPlan getLearningPlan(String planId);

    ResponseDto getAllLearningPlans();

    ResponseDto updateLearningPLan(String planId, LearningPlan plan );

    ResponseDto deleteLearningPlan(String planId);

    ResponseDto updateTaskStatus(String planId, int taskIndex, boolean isCompleted);

    ResponseDto getLearningPlanOfUser(String userId);

}