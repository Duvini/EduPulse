package com.example.edupulse_backend.service;

import com.example.edupulse_backend.payload.response.ResponseDto;
import com.example.edupulse_backend.model.Comment;
import org.springframework.security.core.Authentication;

public interface CommentService {
    // Create comment using Authentication object to extract user details
    ResponseDto addComment(Authentication auth, String postId, String content);
    
    // Get comments for a specific post
    ResponseDto getCommentsByPost(String postId);
    
    // Update and delete operations with authentication to verify ownership
    ResponseDto updateComment(String id, String content, Authentication auth);
    ResponseDto deleteComment(String id, Authentication auth);
}