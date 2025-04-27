package com.example.edupulse_backend.controller;

import com.example.edupulse_backend.model.SkillPost;
import com.example.edupulse_backend.payload.response.ResponseDto;
import com.example.edupulse_backend.service.SkillPostService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.server.mvc.WebMvcLinkBuilder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/skillposts")
@CrossOrigin
@RequiredArgsConstructor
@Slf4j
public class SkillPostController {

    private final SkillPostService service;

    @PostMapping
    public ResponseEntity<EntityModel<ResponseDto>> createPost(
        @RequestParam String description,
        @RequestParam List<String> tags,
        @RequestParam("mediaFiles") MultipartFile[] mediaFiles,
        Authentication authentication
    ) {
        // Pass the authentication object directly to service layer
        ResponseDto response = service.createSkillPost(authentication, description, tags, mediaFiles);
        
        if (response.isError()) {
            return ResponseEntity.badRequest().body(EntityModel.of(response));
        }

        // Create HATEOAS links
        EntityModel<ResponseDto> resource = EntityModel.of(response);
        SkillPost createdPost = (SkillPost) response.getData();
        
        resource.add(WebMvcLinkBuilder.linkTo(WebMvcLinkBuilder.methodOn(SkillPostController.class)
                .getUserPosts(createdPost.getUserId())).withRel("user-posts"));
        resource.add(WebMvcLinkBuilder.linkTo(WebMvcLinkBuilder.methodOn(SkillPostController.class)
                .deletePost(createdPost.getId(), authentication)).withRel("delete-post"));
    
        return new ResponseEntity<>(resource, HttpStatus.CREATED);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ResponseDto> getUserPosts(@PathVariable String userId) {
        log.debug("Getting posts for user: {}", userId);
        ResponseDto response = service.getPostsByUserId(userId);
    
        if (response.isError()) {
            return ResponseEntity.notFound().build();
        }
    
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/followed")
    public ResponseEntity<ResponseDto> getFollowedPosts(
        @RequestBody List<String> userIds,
        Authentication authentication
    ) {
        //verify if the current user is actually following these users
        ResponseDto response = service.getPostsByFollowedUserIds(userIds);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseDto> updatePost(
        @PathVariable String id,
        @RequestParam(required = false) String description,
        @RequestParam(required = false) List<String> tags,
        @RequestParam(value = "mediaFiles", required = false) MultipartFile[] mediaFiles,
        Authentication authentication
    ) {
        // Let service verify ownership and handle the update
        ResponseDto response = service.updateSkillPostWithFiles(id, description, tags, mediaFiles, authentication);
        
        if (response.isError()) {
            String message = response.getMessage();
            if (message != null && message.contains("not found")) {
                return ResponseEntity.notFound().build();
            } else if (message != null && message.contains("not authorized")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
            return ResponseEntity.badRequest().body(response);
        }
        
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseDto> deletePost(
        @PathVariable String id,
        Authentication authentication
    ) {
        // Let service verify ownership and handle the deletion
        ResponseDto response = service.deleteSkillPost(id, authentication);
        
        if (response.isError()) {
            String message = response.getMessage();
            if (message != null && message.contains("not found")) {
                return ResponseEntity.notFound().build();
            } else if (message != null && message.contains("not authorized")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
            return ResponseEntity.badRequest().body(response);
        }
        
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<ResponseDto> getAllPosts() {
        ResponseDto response = service.getAllSkillPosts();
        return ResponseEntity.ok(response);
    }
}