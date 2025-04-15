package com.example.edupulse_backend.service;

import com.example.edupulse_backend.model.SkillPost;
import com.example.edupulse_backend.payload.response.ResponseDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface SkillPostService {
    ResponseDto createSkillPost(String userId, String profilePhotoUrl, String description, List<String> tags, MultipartFile[] files);

    ResponseDto getPostsByUserId(String userId);

    ResponseDto getPostsByFollowedUserIds(List<String> followedUserIds);

    ResponseDto updateSkillPost(String id, SkillPost post);

    ResponseDto deleteSkillPost(String id);
}
