package com.example.edupulse_backend.controller;

import com.example.edupulse_backend.model.SkillPost;
import com.example.edupulse_backend.payload.response.ResponseDto;
import com.example.edupulse_backend.service.SkillPostService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/skillposts")
@CrossOrigin
@RequiredArgsConstructor
public class SkillPostController {

    private final SkillPostService service;

    @PostMapping
    public ResponseDto createPost(@RequestParam String userId,
                                  @RequestParam String userName,
                                  @RequestParam String profilePhotoUrl,
                                  @RequestParam String description,
                                  @RequestParam List<String> tags,
                                  @RequestParam("mediaFiles") MultipartFile[] files) {
        return service.createSkillPost(userId, userName, profilePhotoUrl, description, tags, files);
    }

    @GetMapping("/user/{userId}")
    public ResponseDto getUserPosts(@PathVariable String userId) {
        return service.getPostsByUserId(userId);
    }

    @PostMapping("/followed")
    public ResponseDto getFollowedPosts(@RequestBody List<String> userIds) {
        return service.getPostsByFollowedUsers(userIds);
    }

    @PutMapping("/{id}")
    public ResponseDto updatePost(@PathVariable String id, @RequestBody SkillPost post) {
        return service.updateSkillPost(id, post);
    }

    @DeleteMapping("/{id}")
    public ResponseDto deletePost(@PathVariable String id) {
        return service.deleteSkillPost(id);
    }
}
