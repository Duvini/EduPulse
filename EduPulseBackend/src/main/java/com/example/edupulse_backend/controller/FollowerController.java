package com.example.edupulse_backend.controller;

import com.example.edupulse_backend.payload.response.ResponseDto;
import com.example.edupulse_backend.service.FollowerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/followers")
@CrossOrigin
@RequiredArgsConstructor
@Slf4j
public class FollowerController {

    private final FollowerService followerService;

    @PostMapping("/{userId}/follow")
    public ResponseEntity<ResponseDto> followUser(@PathVariable String userId, Authentication auth) {
        log.info("Request to follow user: {}", userId);
        ResponseDto response = followerService.followUser(userId, auth);
        
        if (response.isError()) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{userId}/unfollow")
    public ResponseEntity<ResponseDto> unfollowUser(@PathVariable String userId, Authentication auth) {
        log.info("Request to unfollow user: {}", userId);
        ResponseDto response = followerService.unfollowUser(userId, auth);
        
        if (response.isError()) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{userId}/followers")
    public ResponseEntity<ResponseDto> getFollowers(@PathVariable String userId) {
        log.info("Request to get followers for user: {}", userId);
        return ResponseEntity.ok(followerService.getFollowers(userId));
    }

    @GetMapping("/{userId}/following")
    public ResponseEntity<ResponseDto> getFollowing(@PathVariable String userId) {
        log.info("Request to get following list for user: {}", userId);
        return ResponseEntity.ok(followerService.getFollowing(userId));
    }

    @GetMapping("/{userId}/stats")
    public ResponseEntity<ResponseDto> getFollowStats(@PathVariable String userId) {
        log.info("Request to get follow stats for user: {}", userId);
        return ResponseEntity.ok(followerService.getFollowStats(userId));
    }

    @GetMapping("/{userId}/status")
    public ResponseEntity<ResponseDto> getFollowStatus(@PathVariable String userId, Authentication auth) {
        log.info("Request to get follow status for user: {}", userId);
        ResponseDto response = followerService.getFollowStatus(userId, auth);
        
        if (response.isError()) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }
}