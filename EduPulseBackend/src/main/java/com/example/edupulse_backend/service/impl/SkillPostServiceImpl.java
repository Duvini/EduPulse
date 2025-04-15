package com.example.edupulse_backend.service.impl;

import com.example.edupulse_backend.model.SkillPost;
import com.example.edupulse_backend.payload.response.ResponseDto;
import com.example.edupulse_backend.repository.SkillPostRepository;
import com.example.edupulse_backend.service.MediaStorageService;
import com.example.edupulse_backend.service.SkillPostService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SkillPostServiceImpl implements SkillPostService {

    private final SkillPostRepository repository;
    private final MediaStorageService mediaStorageService;

    @Override
    public ResponseDto createSkillPost(String userId, String profilePhotoUrl, String description, List<String> tags, MultipartFile[] files) {
        log.info("createSkillPost: started");

        List<String> mediaUrls = mediaStorageService.saveMediaFiles(files);

        SkillPost post = SkillPost.builder()
                .userId(userId)
                .profilePhotoUrl(profilePhotoUrl)
                .description(description)
                .tags(tags)
                .mediaUrls(mediaUrls)
                .build();

        SkillPost saved = repository.save(post);
        log.info("createSkillPost: ended");

        return new ResponseDto(false, saved);
    }

    @Override
    public ResponseDto getPostsByUserId(String userId) {
        return new ResponseDto(false, repository.findByUserId(userId));
    }

    @Override
    public ResponseDto getPostsByFollowedUserIds(List<String> followedUserIds) {
        return new ResponseDto(false, repository.findByUserIdIn(followedUserIds));
    }

    @Override
    public ResponseDto updateSkillPost(String id, SkillPost post) {
        post.setId(id);
        return new ResponseDto(false, repository.save(post));
    }

    @Override
    public ResponseDto deleteSkillPost(String id) {
        repository.deleteById(id);
        return new ResponseDto(false, "Deleted successfully");
    }
}