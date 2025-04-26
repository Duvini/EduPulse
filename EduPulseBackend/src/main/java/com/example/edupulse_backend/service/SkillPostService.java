package com.example.edupulse_backend.service;

import com.example.edupulse_backend.payload.response.ResponseDto;
import com.example.edupulse_backend.model.SkillPost;
import org.springframework.security.core.Authentication;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface SkillPostService {
    // Create post using Authentication object to extract user details
    ResponseDto createSkillPost(Authentication auth, String description, List<String> tags, MultipartFile[] files);
    
    // Basic get operations
    ResponseDto getPostsByUserId(String userId);
    ResponseDto getAllSkillPosts();
    ResponseDto getPostsByFollowedUserIds(List<String> userIds);
    
    // Update and delete operations with authentication to verify ownership
    ResponseDto updateSkillPostWithFiles(String id, String description, List<String> tags, MultipartFile[] files, Authentication auth);
    ResponseDto deleteSkillPost(String id, Authentication auth);
}