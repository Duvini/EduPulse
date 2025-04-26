package com.example.edupulse_backend.controller;

import com.example.edupulse_backend.model.SkillPost;
import com.example.edupulse_backend.payload.response.ResponseDto;
import com.example.edupulse_backend.service.SkillPostService;
import lombok.RequiredArgsConstructor;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.server.mvc.WebMvcLinkBuilder;
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

    @PostMapping
    public ResponseEntity<EntityModel<ResponseDto>> createPost(
            @RequestParam String description,
            @RequestParam List<String> tags,
            @RequestParam("mediaFiles") MultipartFile[] mediaFiles
    ) {
        ResponseDto response = service.createSkillPost(description, tags, mediaFiles);
    
        EntityModel<ResponseDto> resource = EntityModel.of(response);
        resource.add(WebMvcLinkBuilder.linkTo(WebMvcLinkBuilder.methodOn(SkillPostController.class)
                .getUserPosts(((SkillPost) response.getData()).getUserId())).withRel("user-posts"));
        resource.add(WebMvcLinkBuilder.linkTo(WebMvcLinkBuilder.methodOn(SkillPostController.class)
                .deletePost(((SkillPost) response.getData()).getId())).withRel("delete-post"));
    
        return new ResponseEntity<>(resource, HttpStatus.CREATED);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ResponseDto> getUserPosts(@PathVariable String userId) {
    
        // Fetch posts for the given user ID
        ResponseDto response = service.getPostsByUserId(userId);
    
        if (response.isError()) {
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    
    @PostMapping("/followed")
    public ResponseEntity<ResponseDto> getFollowedPosts(@RequestBody List<String> userIds) {
        ResponseDto response = service.getPostsByFollowedUserIds(userIds);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseDto> updatePost(@PathVariable String id, @RequestBody SkillPost post) {
        ResponseDto response = service.updateSkillPost(id, post);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseDto> deletePost(@PathVariable String id) {
        ResponseDto response = service.deleteSkillPost(id);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
