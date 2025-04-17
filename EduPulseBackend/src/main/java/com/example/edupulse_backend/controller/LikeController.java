package com.example.edupulse_backend.controller;

import com.example.edupulse_backend.payload.response.ResponseDto;
import com.example.edupulse_backend.service.LikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/likes")
@CrossOrigin
@RequiredArgsConstructor
public class LikeController {

    private final LikeService likeService;

    @PostMapping("/toggle")
    public ResponseDto toggleLike(@RequestBody Map<String, String> payload) {
        String postId = payload.get("postId");
        String userId = payload.get("userId");
        String userName = payload.get("userName");
        return likeService.toggleLike(postId, userId, userName);
    }

    @GetMapping("/post/{postId}")
    public ResponseDto getLikes(@PathVariable String postId) {
        return likeService.getLikesByPost(postId);
    }

    @GetMapping("/status")
    public ResponseDto getLikeStatus(@RequestParam String postId, @RequestParam String userId) {
        return likeService.getLikeStatus(postId, userId);
    }

    @GetMapping("/count/{postId}")
    public ResponseDto getLikeCount(@PathVariable String postId) {
        return likeService.getLikeCount(postId);
    }
}