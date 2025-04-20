package com.example.edupulse_backend.controller;

import com.example.edupulse_backend.model.ProgressUpdate;
import com.example.edupulse_backend.payload.response.ResponseDto;
import com.example.edupulse_backend.service.ProgressUpdateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/api/v1/progress")
@RequiredArgsConstructor
public class ProgressUpdateController {

    private final ProgressUpdateService progressUpdateService;

    @RequestMapping
    public String listProgress() {
        return "Listing progress updates";
    }

    @RequestMapping("/user/{userId}")
    public ResponseDto getProgressByUser(
            @PathVariable String userId

    ) {

        return progressUpdateService.getProgressByUser(userId);
    }

    @RequestMapping("/progress/{progressId}")
    public ResponseDto getProgressById(@PathVariable String progressId) {

        return progressUpdateService.getProgressById(progressId);
    }

    @PostMapping("/create")
    public ResponseDto createProgress(@RequestBody ProgressUpdate progressUpdate) {

        return progressUpdateService.createProgress(progressUpdate);
    }

    @PutMapping("/update/{progressId}")
    public ResponseDto updateProgress(
            @PathVariable String progressId,
            @RequestBody ProgressUpdate progressUpdate
    ) {

        return progressUpdateService.updateProgress(progressId, progressUpdate);
    }

    @DeleteMapping("/delete/{progressId}")
    public ResponseDto deleteProgress(@PathVariable String progressId) {
        return new ResponseDto(false, progressUpdateService.deleteProgress(progressId));
    }

}
