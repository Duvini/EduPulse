package com.example.edupulse_backend.service.impl;

import com.example.edupulse_backend.model.Like;
import com.example.edupulse_backend.payload.response.ResponseDto;
import com.example.edupulse_backend.repository.LikeRepository;
import com.example.edupulse_backend.service.LikeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class LikeServiceImpl implements LikeService {

    private final LikeRepository likeRepository;

    @Override
    public ResponseDto toggleLike(String postId, String userId, String userName) {
        log.info("toggleLike for postId {} and userId {}: started", postId, userId);
        
        boolean liked = false;
        Optional<Like> existingLike = likeRepository.findByPostIdAndUserId(postId, userId);
        
        if (existingLike.isPresent()) {
            // User already liked the post, so unlike it
            likeRepository.delete(existingLike.get());
            liked = false;
            log.info("toggleLike: User {} unliked post {}", userId, postId);
        } else {
            // User hasn't liked the post, so like it
            Like like = new Like(postId, userId, userName);
            likeRepository.save(like);
            liked = true;
            log.info("toggleLike: User {} liked post {}", userId, postId);
        }
        
        // Return current like status and count
        long likeCount = likeRepository.countByPostId(postId);
        Map<String, Object> response = new HashMap<>();
        response.put("liked", liked);
        response.put("likeCount", likeCount);
        
        log.info("toggleLike: ended with status {} and count {}", liked, likeCount);
        return new ResponseDto(false, response);
    }

    @Override
    public ResponseDto getLikesByPost(String postId) {
        log.info("getLikesByPost for postId {}: started", postId);
        List<Like> likes = likeRepository.findByPostId(postId);
        long likeCount = likes.size();
        
        Map<String, Object> response = new HashMap<>();
        response.put("likes", likes);
        response.put("likeCount", likeCount);
        
        log.info("getLikesByPost: ended with count {}", likeCount);
        return new ResponseDto(false, response);
    }

    @Override
    public ResponseDto getLikeStatus(String postId, String userId) {
        log.info("getLikeStatus for postId {} and userId {}: started", postId, userId);
        boolean liked = likeRepository.existsByPostIdAndUserId(postId, userId);
        log.info("getLikeStatus: ended with status {}", liked);
        return new ResponseDto(false, liked);
    }

    @Override
    public ResponseDto getLikeCount(String postId) {
        log.info("getLikeCount for postId {}: started", postId);
        long count = likeRepository.countByPostId(postId);
        log.info("getLikeCount: ended with count {}", count);
        return new ResponseDto(false, count);
    }
}