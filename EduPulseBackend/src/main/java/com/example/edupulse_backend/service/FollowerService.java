package com.example.edupulse_backend.service;

import com.example.edupulse_backend.payload.response.ResponseDto;
import org.springframework.security.core.Authentication;

public interface FollowerService {
    ResponseDto followUser(String followingId, Authentication auth);
    ResponseDto unfollowUser(String followingId, Authentication auth);
    ResponseDto getFollowers(String userId);
    ResponseDto getFollowing(String userId);
    ResponseDto getFollowStats(String userId);
    ResponseDto getFollowStatus(String userId, Authentication auth);
}