package com.example.edupulse_backend.controller;

import com.example.edupulse_backend.model.SkillPost;
import com.example.edupulse_backend.payload.response.ResponseDto;
import com.example.edupulse_backend.service.SkillPostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/skillposts")
@CrossOrigin
@RequiredArgsConstructor
public class SkillPostController {

    private final SkillPostService service;

    // Create a skill post
    @PostMapping
    public ResponseEntity<ResponseDto> createPost(
            @RequestParam String userId,
            @RequestParam String userName,
            @RequestParam String profilePhotoUrl,
            @RequestParam String description,
            @RequestParam List<String> tags,
            @RequestParam("mediaFiles") MultipartFile[] mediaFiles
    ) {
        ResponseDto response = service.createSkillPost(userId, userName, profilePhotoUrl, description, tags, mediaFiles);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // Get all skill posts by user ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<ResponseDto> getUserPosts(@PathVariable String userId) {
        ResponseDto response = service.getPostsByUserId(userId);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Get posts from followed users
    @PostMapping("/followed")
    public ResponseEntity<ResponseDto> getFollowedPosts(@RequestBody List<String> userIds) {
        ResponseDto response = service.getPostsByFollowedUserIds(userIds);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Update a skill post
    @PutMapping("/{id}")
    public ResponseEntity<ResponseDto> updatePost(
            @PathVariable String id,
            @RequestBody SkillPost post
    ) {
        ResponseDto response = service.updateSkillPost(id, post);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Delete a skill post
    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseDto> deletePost(@PathVariable String id) {
        ResponseDto response = service.deleteSkillPost(id);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
