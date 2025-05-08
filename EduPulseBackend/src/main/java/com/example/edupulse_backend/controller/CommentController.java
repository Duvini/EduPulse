package com.example.edupulse_backend.controller;

import com.example.edupulse_backend.model.Comment;
import com.example.edupulse_backend.payload.response.ResponseDto;
import com.example.edupulse_backend.service.CommentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.server.mvc.WebMvcLinkBuilder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/comments")
@CrossOrigin
@RequiredArgsConstructor
@Slf4j
public class CommentController {

    private final CommentService commentService;

    @PostMapping
    public ResponseEntity<EntityModel<ResponseDto>> createComment(
        @RequestParam String postId,
        @RequestParam String content,
        Authentication authentication
    ) {
        // Pass the authentication object directly to service layer
        ResponseDto response = commentService.addComment(authentication, postId, content);
        
        if (response.isError()) {
            return ResponseEntity.badRequest().body(EntityModel.of(response));
        }

        // Create HATEOAS links
        EntityModel<ResponseDto> resource = EntityModel.of(response);
        Comment createdComment = (Comment) response.getData();
        
        resource.add(WebMvcLinkBuilder.linkTo(WebMvcLinkBuilder.methodOn(CommentController.class)
                .getCommentsByPost(createdComment.getPostId())).withRel("post-comments"));
        resource.add(WebMvcLinkBuilder.linkTo(WebMvcLinkBuilder.methodOn(CommentController.class)
                .deleteComment(createdComment.getId(), authentication)).withRel("delete-comment"));
    
        return new ResponseEntity<>(resource, HttpStatus.CREATED);
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<ResponseDto> getCommentsByPost(@PathVariable String postId) {
        log.debug("Getting comments for post: {}", postId);
        ResponseDto response = commentService.getCommentsByPost(postId);
    
        if (response.isError()) {
            String message = response.getMessage();
            if (message != null && message.contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(response);
        }
    
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseDto> updateComment(
        @PathVariable String id,
        @RequestParam String content,
        Authentication authentication
    ) {
        // Let service verify ownership and handle the update
        ResponseDto response = commentService.updateComment(id, content, authentication);
        
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
    public ResponseEntity<ResponseDto> deleteComment(
        @PathVariable String id,
        Authentication authentication
    ) {
        // Let service verify ownership and handle the deletion
        ResponseDto response = commentService.deleteComment(id, authentication);
        
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
}