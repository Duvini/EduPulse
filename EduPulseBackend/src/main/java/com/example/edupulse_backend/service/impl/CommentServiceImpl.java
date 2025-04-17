package com.example.edupulse_backend.service.impl;

import com.example.edupulse_backend.model.Comment;
import com.example.edupulse_backend.model.SkillPost;
import com.example.edupulse_backend.payload.response.ResponseDto;
import com.example.edupulse_backend.repository.CommentRepository;
import com.example.edupulse_backend.repository.SkillPostRepository;
import com.example.edupulse_backend.service.CommentService;
import com.example.edupulse_backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final SkillPostRepository skillPostRepository;
    private final NotificationService notificationService;

    @Override
    public ResponseDto addComment(Comment comment) {
        if (comment == null || comment.getPostId() == null || comment.getUserId() == null) {
            return new ResponseDto(true, "Comment cannot be null and must contain post ID and user ID");
        }
        
        log.info("addComment: started for post {}", comment.getPostId());
        
        Comment savedComment = commentRepository.save(comment);
        
        // Get post details to find post owner for notification
        Optional<SkillPost> postOpt = skillPostRepository.findById(comment.getPostId());
        if (postOpt.isPresent()) {
            SkillPost post = postOpt.get();
            // Create notification for post owner
            notificationService.createCommentNotification(
                comment.getPostId(),
                savedComment.getId(),
                comment.getUserId(),
                comment.getUserName(),
                post.getUserId()
            );
        }
        
        log.info("addComment: ended successfully with comment ID {}", savedComment.getId());
        return new ResponseDto(false, savedComment);
    }

    @Override
    public ResponseDto getCommentsByPost(String postId) {
        if (postId == null) {
            return new ResponseDto(true, "Post ID cannot be null");
        }
        
        log.info("getCommentsByPost for postId {}: started", postId);
        List<Comment> comments = commentRepository.findByPostId(postId);
        log.info("getCommentsByPost: ended with {} comments found", comments.size());
        return new ResponseDto(false, comments);
    }

    @Override
    public ResponseDto updateComment(String id, String content) {
        if (id == null || content == null) {
            return new ResponseDto(true, "Comment ID and content cannot be null");
        }
        
        log.info("updateComment for id {}: started", id);
        Optional<Comment> existingComment = commentRepository.findById(id);
        
        if (existingComment.isPresent()) {
            Comment comment = existingComment.get();
            comment.setContent(content);
            comment.updateTimestamp();
            Comment updatedComment = commentRepository.save(comment);
            log.info("updateComment: ended successfully");
            return new ResponseDto(false, updatedComment);
        } else {
            log.warn("updateComment: comment not found with id {}", id);
            return new ResponseDto(true, "Comment not found");
        }
    }

    @Override
    public ResponseDto deleteComment(String id) {
        if (id == null) {
            return new ResponseDto(true, "Comment ID cannot be null");
        }
        
        log.info("deleteComment for id {}: started", id);
        
        // Check if comment exists first
        boolean exists = commentRepository.existsById(id);
        if (!exists) {
            log.warn("deleteComment: comment not found with id {}", id);
            return new ResponseDto(true, "Comment not found");
        }
        
        commentRepository.deleteById(id);
        log.info("deleteComment: ended successfully");
        return new ResponseDto(false, "Deleted successfully");
    }
}