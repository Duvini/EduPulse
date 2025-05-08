package com.example.edupulse_backend.controller;

import com.example.edupulse_backend.model.Like;
import com.example.edupulse_backend.payload.response.ResponseDto;
import com.example.edupulse_backend.service.LikeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.server.mvc.WebMvcLinkBuilder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/likes")
@CrossOrigin
@RequiredArgsConstructor
@Slf4j
public class LikeController {

    private final LikeService likeService;

    @PostMapping("/toggle/{postId}")
    public ResponseEntity<EntityModel<ResponseDto>> toggleLike(
            @PathVariable String postId,
            Authentication authentication
    ) {
        log.debug("Toggle like for post: {}", postId);
        ResponseDto response = likeService.toggleLike(postId, authentication);
        
        if (response.isError()) {
            return ResponseEntity.badRequest().body(EntityModel.of(response));
        }

        // Create HATEOAS links
        EntityModel<ResponseDto> resource = EntityModel.of(response);
        resource.add(WebMvcLinkBuilder.linkTo(WebMvcLinkBuilder.methodOn(LikeController.class)
                .getLikes(postId)).withRel("post-likes"));
        resource.add(WebMvcLinkBuilder.linkTo(WebMvcLinkBuilder.methodOn(LikeController.class)
                .getLikeStatus(postId, authentication)).withRel("like-status"));
        
        return new ResponseEntity<>(resource, HttpStatus.OK);
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<ResponseDto> getLikes(@PathVariable String postId) {
        log.debug("Getting likes for post: {}", postId);
        ResponseDto response = likeService.getLikesByPost(postId);
        
        if (response.isError()) {
            String message = response.getMessage();
            if (message != null && message.contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(response);
        }
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status/{postId}")
    public ResponseEntity<ResponseDto> getLikeStatus(
            @PathVariable String postId,
            Authentication authentication
    ) {
        log.debug("Getting like status for post: {} and authenticated user", postId);
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ResponseDto(true, "Authentication required"));
        }
        
        ResponseDto response = likeService.getLikeStatus(postId, authentication);
        
        if (response.isError()) {
            String message = response.getMessage();
            if (message != null && message.contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(response);
        }
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/count/{postId}")
    public ResponseEntity<ResponseDto> getLikeCount(@PathVariable String postId) {
        log.debug("Getting like count for post: {}", postId);
        ResponseDto response = likeService.getLikeCount(postId);
        
        if (response.isError()) {
            String message = response.getMessage();
            if (message != null && message.contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(response);
        }
        
        return ResponseEntity.ok(response);
    }
}