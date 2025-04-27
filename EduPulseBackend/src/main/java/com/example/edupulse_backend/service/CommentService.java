package com.example.edupulse_backend.service;

import com.example.edupulse_backend.model.Comment;
import com.example.edupulse_backend.payload.response.ResponseDto;

public interface CommentService {
    ResponseDto addComment(Comment comment);

    ResponseDto getCommentsByPost(String postId);

    ResponseDto updateComment(String id, String content);

    ResponseDto deleteComment(String id);
}