package com.example.edupulse_backend.service;

import com.example.edupulse_backend.payload.response.ResponseDto;

public interface LikeService {
    ResponseDto toggleLike(String postId, String userId, String userName);

    ResponseDto getLikesByPost(String postId);

    ResponseDto getLikeStatus(String postId, String userId);
    
    ResponseDto getLikeCount(String postId);
}