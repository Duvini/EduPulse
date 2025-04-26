package com.example.edupulse_backend.service;

import com.example.edupulse_backend.model.LearningPlan;
import com.example.edupulse_backend.model.ProgressUpdate;
import com.example.edupulse_backend.payload.response.ResponseDto;
import com.example.edupulse_backend.repository.ProgressUpdateRepository;

import java.time.LocalDateTime;

public interface ProgressUpdateService {

    ResponseDto createProgress(ProgressUpdate progressUpdate);

    ResponseDto updateProgress(String progressId, ProgressUpdate progressUpdate);

    ResponseDto getProgressByUser(String userId);

    ResponseDto getProgressById(String progressId);

    ResponseDto deleteProgress(String progressId);
}
