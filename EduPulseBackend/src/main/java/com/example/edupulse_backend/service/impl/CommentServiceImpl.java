package com.example.edupulse_backend.service.impl;

import com.example.edupulse_backend.model.Comment;
import com.example.edupulse_backend.payload.response.ResponseDto;
import com.example.edupulse_backend.repository.CommentRepository;
import com.example.edupulse_backend.service.CommentService;
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

    @Override
    public ResponseDto addComment(Comment comment) {
        log.info("addComment: started");
        Comment savedComment = commentRepository.save(comment);
        log.info("addComment: ended");
        return new ResponseDto(false, savedComment);
    }

    @Override
    public ResponseDto getCommentsByPost(String postId) {
        log.info("getCommentsByPost for postId {}: started", postId);
        List<Comment> comments = commentRepository.findByPostId(postId);
        log.info("getCommentsByPost: ended");
        return new ResponseDto(false, comments);
    }

    @Override
    public ResponseDto updateComment(String id, String content) {
        log.info("updateComment for id {}: started", id);
        Optional<Comment> existingComment = commentRepository.findById(id);
        
        if (existingComment.isPresent()) {
            Comment comment = existingComment.get();
            comment.setContent(content);
            comment.updateTimestamp();
            Comment updatedComment = commentRepository.save(comment);
            log.info("updateComment: ended");
            return new ResponseDto(false, updatedComment);
        } else {
            log.warn("updateComment: comment not found with id {}", id);
            return new ResponseDto(true, "Comment not found");
        }
    }

    @Override
    public ResponseDto deleteComment(String id) {
        log.info("deleteComment for id {}: started", id);
        commentRepository.deleteById(id);
        log.info("deleteComment: ended");
        return new ResponseDto(false, "Deleted successfully");
    }
}