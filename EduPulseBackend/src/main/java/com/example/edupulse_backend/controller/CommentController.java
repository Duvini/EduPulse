package com.example.edupulse_backend.controller;

import com.example.edupulse_backend.model.Comment;
import com.example.edupulse_backend.payload.response.ResponseDto;
import com.example.edupulse_backend.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping
    public ResponseDto createComment(@RequestBody Map<String, String> payload) {
        String postId = payload.get("postId");
        String userId = payload.get("userId");
        String userName = payload.get("userName");
        String content = payload.get("content");
        
        Comment comment = new Comment(postId, userId, userName, content);
        return commentService.addComment(comment);
    }

    @GetMapping("/post/{postId}")
    public ResponseDto getComments(@PathVariable String postId) {
        return commentService.getCommentsByPost(postId);
    }

    @PutMapping("/{id}")
    public ResponseDto updateComment(@PathVariable String id, @RequestBody Map<String, String> payload) {
        String content = payload.get("content");
        return commentService.updateComment(id, content);
    }

    @DeleteMapping("/{id}")
    public ResponseDto deleteComment(@PathVariable String id) {
        return commentService.deleteComment(id);
    }
}