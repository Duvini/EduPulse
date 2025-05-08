package com.example.edupulse_backend.service;

import com.example.edupulse_backend.payload.response.ResponseDto;
import org.springframework.security.core.Authentication;

public interface LikeService {
    // Toggle like using Authentication object to extract user details
    ResponseDto toggleLike(String postId, Authentication auth);
    
    // Get likes for a specific post
    ResponseDto getLikesByPost(String postId);

    // Get like status for a specific post and authenticated user
    ResponseDto getLikeStatus(String postId, Authentication auth);
    
    // Get like count for a specific post
    ResponseDto getLikeCount(String postId);
}