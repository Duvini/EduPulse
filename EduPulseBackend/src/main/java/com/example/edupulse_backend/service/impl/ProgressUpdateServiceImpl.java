package com.example.edupulse_backend.service.impl;

import com.example.edupulse_backend.model.LearningPlan;
import com.example.edupulse_backend.model.ProgressUpdate;
import com.example.edupulse_backend.payload.response.ResponseDto;
import com.example.edupulse_backend.repository.ProgressUpdateRepository;
import com.example.edupulse_backend.service.ProgressUpdateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProgressUpdateServiceImpl implements ProgressUpdateService {

    @Autowired
    private final ProgressUpdateRepository repository;

    //logic to create a progress
    @Override
    public ResponseDto createProgress(ProgressUpdate progressUpdate) {
        try{
            repository.save(progressUpdate);
            log.info("Created progress update");
            return new ResponseDto(false, progressUpdate);
        }catch(Exception e){
            return new ResponseDto(true, e.getMessage());
        }
    }

    //business logic to update progresses
    @Override
    public ResponseDto updateProgress(String progressId, ProgressUpdate progressUpdate) {
        try {
            Optional<ProgressUpdate> optionalProgress = repository.findById(progressId);

            if (optionalProgress.isPresent()) {
                ProgressUpdate existingProgress = optionalProgress.get();

                // Update fields if provided
                if (progressUpdate.getTemplate() != null) {
                    existingProgress.setTemplate(progressUpdate.getTemplate());
                }
                if (progressUpdate.getContent() != null) {
                    existingProgress.setContent(progressUpdate.getContent());
                }
                if (progressUpdate.getFinishedAt() != null) {
                    existingProgress.setFinishedAt(progressUpdate.getFinishedAt());
                }

                // Save updated progress
                ProgressUpdate saved = repository.save(existingProgress);
                return new ResponseDto(false, saved);
            } else {
                return new ResponseDto(true, "Progress update not found with ID: " + progressId);
            }
        } catch (Exception e) {
            return new ResponseDto(true, "Error updating progress: " + e.getMessage());
        }
    }


    //logic to get progress updates based on a user
    @Override
    public ResponseDto getProgressByUser(String userId) {
        List<ProgressUpdate> progressUpdates = repository.findByUserId(userId);
        return new ResponseDto(false, progressUpdates);
    }

    //logic to get progress updates by its ID
    @Override
    public ResponseDto getProgressById(String progressId) {
        Optional<ProgressUpdate> progressUpdate = repository.findById(progressId);
        return new ResponseDto(false, progressUpdate);
    }

    //logic to delete a progress update
    @Override
    public ResponseDto deleteProgress(String progressId) {
        repository.deleteById(progressId);
        return new ResponseDto(false, "Deleted progress with ID: " + progressId);
    }
}
