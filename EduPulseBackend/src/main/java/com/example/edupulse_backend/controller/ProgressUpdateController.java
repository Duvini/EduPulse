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


    @RequestMapping("/user/{userId}")
    public ResponseEntity<ResponseDto> getProgressByUser(
            @PathVariable String userId

    ) {
        ResponseDto response = progressUpdateService.getProgressByUser(userId);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @RequestMapping("/progress/{progressId}")
    public ResponseEntity<ResponseDto> getProgressById(@PathVariable String progressId) {
        ResponseDto response = progressUpdateService.getProgressById(progressId);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/create")
    public ResponseEntity<ResponseDto> createProgress(@RequestBody ProgressUpdate progressUpdate) {
        ResponseDto response = progressUpdateService.createProgress(progressUpdate);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/update/{progressId}")
    public ResponseEntity<ResponseDto> updateProgress(
            @PathVariable String progressId,
            @RequestBody ProgressUpdate progressUpdate
    ) {
        ResponseDto response = progressUpdateService.updateProgress(progressId, progressUpdate);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @DeleteMapping("/delete/{progressId}")
    public ResponseEntity<ResponseDto> deleteProgress(@PathVariable String progressId) {
        ResponseDto response = progressUpdateService.deleteProgress(progressId);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

}
