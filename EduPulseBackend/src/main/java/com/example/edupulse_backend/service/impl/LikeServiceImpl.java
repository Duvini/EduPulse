package com.example.edupulse_backend.service.impl;

import com.example.edupulse_backend.exception.ResourceNotFoundException;
import com.example.edupulse_backend.model.Like;
import com.example.edupulse_backend.model.SkillPost;
import com.example.edupulse_backend.model.User;
import com.example.edupulse_backend.payload.response.ResponseDto;
import com.example.edupulse_backend.repository.LikeRepository;
import com.example.edupulse_backend.repository.SkillPostRepository;
import com.example.edupulse_backend.repository.UserRepository;
import com.example.edupulse_backend.service.LikeService;
import com.example.edupulse_backend.util.NotificationHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
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
    private final SkillPostRepository skillPostRepository;
    private final UserRepository userRepository;
    private final NotificationHandler notificationHandler;

    @Override
    public ResponseDto toggleLike(String postId, Authentication auth) {
        // Check if authentication is valid
        if (auth == null || !auth.isAuthenticated()) {
            log.warn("toggleLike: Authentication is missing or invalid");
            return new ResponseDto(true, "Authentication required");
        }
        
        if (postId == null) {
            log.warn("toggleLike: Post ID is null");
            return new ResponseDto(true, "Post ID cannot be null");
        }
        
        try {
            // Extract user details from Authentication
            UserDetails userDetails = (UserDetails) auth.getPrincipal();
            String username = userDetails.getUsername();
            
            // Get full user info from username
            User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            
            String userId = user.getId();
            String userName = user.getName();
            
            log.info("toggleLike: Processing like toggle for postId {} by userId {}", postId, userId);
            
            // Verify the post exists
            Optional<SkillPost> postOpt = skillPostRepository.findById(postId);
            if (postOpt.isEmpty()) {
                log.warn("toggleLike: Post with id {} not found", postId);
                return new ResponseDto(true, "Post not found with id: " + postId);
            }
            
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
                
                // Get post details for notification
                SkillPost post = postOpt.get();
                
                // Create notification for post owner (if liker is not the post owner)
                if (!userId.equals(post.getUserId())) {
                    notificationHandler.sendLikeNotification(
                        post.getUserId(),  // recipientId
                        userId,            // senderId
                        userName,          // senderName
                        postId             // postId
                    );
                }
            }
            
            // Return current like status and count
            long likeCount = likeRepository.countByPostId(postId);
            Map<String, Object> response = new HashMap<>();
            response.put("liked", liked);
            response.put("likeCount", likeCount);
            
            log.info("toggleLike: ended with status {} and count {}", liked, likeCount);
            return new ResponseDto(false, response);
            
        } catch (Exception e) {
            log.error("Error in toggleLike: ", e);
            return new ResponseDto(true, "Error toggling like: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto getLikesByPost(String postId) {
        if (postId == null) {
            log.warn("getLikesByPost: Post ID is null");
            return new ResponseDto(true, "Post ID cannot be null");
        }
        
        log.info("getLikesByPost: Fetching likes for postId {}", postId);
        
        // Verify the post exists first
        boolean postExists = skillPostRepository.existsById(postId);
        if (!postExists) {
            log.warn("getLikesByPost: Post with id {} not found", postId);
            return new ResponseDto(true, "Post not found with id: " + postId);
        }
        
        List<Like> likes = likeRepository.findByPostId(postId);
        long likeCount = likes.size();
        
        Map<String, Object> response = new HashMap<>();
        response.put("likes", likes);
        response.put("likeCount", likeCount);
        
        log.info("getLikesByPost: Found {} likes for post {}", likeCount, postId);
        return new ResponseDto(false, response);
    }

    @Override
    public ResponseDto getLikeStatus(String postId, Authentication auth) {
        // Check if authentication is valid
        if (auth == null || !auth.isAuthenticated()) {
            log.warn("getLikeStatus: Authentication is missing or invalid");
            return new ResponseDto(true, "Authentication required");
        }
        
        if (postId == null) {
            log.warn("getLikeStatus: Post ID is null");
            return new ResponseDto(true, "Post ID cannot be null");
        }
        
        try {
            // Extract user details from Authentication
            UserDetails userDetails = (UserDetails) auth.getPrincipal();
            String username = userDetails.getUsername();
            
            // Get full user info from username
            User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            
            String userId = user.getId();
            
            log.info("getLikeStatus: Checking like status for postId {} and userId {}", postId, userId);
            
            // Verify the post exists first
            boolean postExists = skillPostRepository.existsById(postId);
            if (!postExists) {
                log.warn("getLikeStatus: Post with id {} not found", postId);
                return new ResponseDto(true, "Post not found with id: " + postId);
            }
            
            boolean liked = likeRepository.existsByPostIdAndUserId(postId, userId);
            log.info("getLikeStatus: User {} {} liked post {}", userId, liked ? "has" : "has not", postId);
            
            return new ResponseDto(false, liked);
            
        } catch (Exception e) {
            log.error("Error in getLikeStatus: ", e);
            return new ResponseDto(true, "Error getting like status: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto getLikeCount(String postId) {
        if (postId == null) {
            log.warn("getLikeCount: Post ID is null");
            return new ResponseDto(true, "Post ID cannot be null");
        }
        
        log.info("getLikeCount: Counting likes for postId {}", postId);
        
        // Verify the post exists first
        boolean postExists = skillPostRepository.existsById(postId);
        if (!postExists) {
            log.warn("getLikeCount: Post with id {} not found", postId);
            return new ResponseDto(true, "Post not found with id: " + postId);
        }
        
        long count = likeRepository.countByPostId(postId);
        log.info("getLikeCount: Found {} likes for post {}", count, postId);
        
        return new ResponseDto(false, count);
    }
}