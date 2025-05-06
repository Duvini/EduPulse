package com.example.edupulse_backend.service.impl;

import com.example.edupulse_backend.exception.ResourceNotFoundException;
import com.example.edupulse_backend.model.Comment;
import com.example.edupulse_backend.model.SkillPost;
import com.example.edupulse_backend.model.User;
import com.example.edupulse_backend.payload.response.ResponseDto;
import com.example.edupulse_backend.repository.CommentRepository;
import com.example.edupulse_backend.repository.SkillPostRepository;
import com.example.edupulse_backend.repository.UserRepository;
import com.example.edupulse_backend.service.CommentService;
import com.example.edupulse_backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final SkillPostRepository skillPostRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Override
    public ResponseDto addComment(Authentication auth, String postId, String content) {
        // Check if authentication is valid
        if (auth == null || !auth.isAuthenticated()) {
            log.warn("addComment: Authentication is missing or invalid");
            return new ResponseDto(true, "Authentication required");
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
            
            log.info("addComment: Adding comment for postId {} by userId {}", postId, userId);
            
            // Check if post exists
            Optional<SkillPost> postOpt = skillPostRepository.findById(postId);
            if (postOpt.isEmpty()) {
                log.warn("addComment: Post with id {} not found", postId);
                return new ResponseDto(true, "Post not found with id: " + postId);
            }
            
            // Create and save the comment with explicit UTC timestamps
            LocalDateTime now = LocalDateTime.now(ZoneOffset.UTC);
            Comment comment = Comment.builder()
                    .postId(postId)
                    .userId(userId)
                    .userName(userName)
                    .content(content)
                    .createdAt(now)
                    .updatedAt(now)
                    .build();
            
            // Ensure timestamps are set (double safety)
            comment.ensureTimestamps();
            
            Comment savedComment = commentRepository.save(comment);
            
            // Get post details for notification
            SkillPost post = postOpt.get();
            
            // Create notification for post owner (if commenter is not the post owner)
            if (!userId.equals(post.getUserId())) {
                notificationService.createCommentNotification(
                    postId,
                    savedComment.getId(),
                    userId,
                    userName,
                    post.getUserId()
                );
            }
            
            log.info("addComment: Successfully added comment with ID {} for post {}", savedComment.getId(), postId);
            return new ResponseDto(false, savedComment);
            
        } catch (Exception e) {
            log.error("Error in addComment: ", e);
            return new ResponseDto(true, "Error adding comment: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto getCommentsByPost(String postId) {
        if (postId == null || postId.isEmpty()) {
            log.warn("getCommentsByPost: Received null or empty postId");
            return new ResponseDto(true, "Post ID cannot be null or empty");
        }
        
        log.info("getCommentsByPost: Fetching comments for postId {}", postId);
        
        // Verify the post exists first
        boolean postExists = skillPostRepository.existsById(postId);
        if (!postExists) {
            log.warn("getCommentsByPost: Post with id {} not found", postId);
            return new ResponseDto(true, "Post not found with id: " + postId);
        }
        
        List<Comment> comments = commentRepository.findByPostId(postId);
        log.info("getCommentsByPost: Found {} comments for post {}", comments.size(), postId);
        
        return new ResponseDto(false, comments);
    }

    @Override
    public ResponseDto updateComment(String id, String content, Authentication auth) {
        log.info("updateComment: Updating comment with id {}", id);
        
        if (auth == null || !auth.isAuthenticated()) {
            log.warn("updateComment: Authentication is missing or invalid");
            return new ResponseDto(true, "Authentication required");
        }
        
        try {
            // Check if comment exists
            Optional<Comment> optionalComment = commentRepository.findById(id);
            if (optionalComment.isEmpty()) {
                log.warn("updateComment: Comment with id {} not found", id);
                return new ResponseDto(true, "Comment not found with id: " + id);
            }
            
            // Get current user
            UserDetails userDetails = (UserDetails) auth.getPrincipal();
            User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            
            // Get existing comment
            Comment existingComment = optionalComment.get();
            
            // Verify ownership - only comment creator can update
            if (!existingComment.getUserId().equals(currentUser.getId())) {
                log.warn("updateComment: User {} is not authorized to update comment {}", 
                    currentUser.getId(), id);
                return new ResponseDto(true, "You are not authorized to update this comment");
            }
            
            // Update content
            if (content != null && !content.isEmpty()) {
                existingComment.setContent(content);
                existingComment.setUpdatedAt(LocalDateTime.now(ZoneOffset.UTC)); // Use UTC time
                
                Comment updatedComment = commentRepository.save(existingComment);
                log.info("updateComment: Successfully updated comment with id {}", id);
                
                return new ResponseDto(false, updatedComment);
            } else {
                log.warn("updateComment: Content is null or empty");
                return new ResponseDto(true, "Comment content cannot be empty");
            }
            
        } catch (Exception e) {
            log.error("Error in updateComment: ", e);
            return new ResponseDto(true, "Error updating comment: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto deleteComment(String id, Authentication auth) {
        log.info("deleteComment: Deleting comment with id {}", id);
        
        if (auth == null || !auth.isAuthenticated()) {
            log.warn("deleteComment: Authentication is missing or invalid");
            return new ResponseDto(true, "Authentication required");
        }
        
        try {
            // Check if comment exists
            Optional<Comment> optionalComment = commentRepository.findById(id);
            if (optionalComment.isEmpty()) {
                log.warn("deleteComment: Comment with id {} not found", id);
                return new ResponseDto(true, "Comment not found with id: " + id);
            }
            
            // Get current user
            UserDetails userDetails = (UserDetails) auth.getPrincipal();
            User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            
            // Get existing comment
            Comment existingComment = optionalComment.get();
            
            // Check if user is comment creator or post owner
            boolean isCommentCreator = existingComment.getUserId().equals(currentUser.getId());
            
            // If not comment creator, check if user is post owner
            boolean isPostOwner = false;
            if (!isCommentCreator) {
                Optional<SkillPost> post = skillPostRepository.findById(existingComment.getPostId());
                if (post.isPresent()) {
                    isPostOwner = post.get().getUserId().equals(currentUser.getId());
                }
            }
            
            if (!isCommentCreator && !isPostOwner) {
                log.warn("deleteComment: User {} is not authorized to delete comment {}", 
                    currentUser.getId(), id);
                return new ResponseDto(true, "You are not authorized to delete this comment");
            }
            
            commentRepository.deleteById(id);
            log.info("deleteComment: Successfully deleted comment with id {}", id);
            
            return new ResponseDto(false, "Comment deleted successfully");
            
        } catch (Exception e) {
            log.error("Error in deleteComment: ", e);
            return new ResponseDto(true, "Error deleting comment: " + e.getMessage());
        }
    }
}