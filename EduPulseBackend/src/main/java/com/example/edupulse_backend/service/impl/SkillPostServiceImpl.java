package com.example.edupulse_backend.service.impl;

import com.example.edupulse_backend.model.SkillPost;
import com.example.edupulse_backend.payload.response.ResponseDto;
import com.example.edupulse_backend.repository.SkillPostRepository;
import com.example.edupulse_backend.service.MediaStorageService;
import com.example.edupulse_backend.service.SkillPostService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
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
    public ResponseDto createSkillPost(String description, List<String> tags, MultipartFile[] files) {
        log.info("createSkillPost: started");

        // Get the current user from the security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetails)) {
            throw new IllegalStateException("User is not authenticated");
        }

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String userId = userDetails.getUsername(); // Assuming username is the user ID
        String userName = userDetails.getUsername(); // Replace with actual user name if available
        String profilePhotoUrl = ""; // Fetch from user profile if needed

        // Save media files
        List<String> mediaUrls = mediaStorageService.saveMediaFiles(files);

        // Create and save the skill post
        SkillPost post = SkillPost.builder()
                .userId(userId)
                .userName(userName)
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
        log.info("getPostsByUserId: Fetching posts for userId {}", userId);
        return new ResponseDto(false, repository.findByUserId(userId));
    }

    @Override
    public ResponseDto getPostsByFollowedUserIds(List<String> followedUserIds) {
        log.info("getPostsByFollowedUserIds: Fetching posts for followed user IDs {}", followedUserIds);
        return new ResponseDto(false, repository.findByUserIdIn(followedUserIds));
    }

    @Override
    public ResponseDto updateSkillPost(String id, SkillPost post) {
        log.info("updateSkillPost: Updating post with id {}", id);
        post.setId(id);
        return new ResponseDto(false, repository.save(post));
    }

    @Override
    public ResponseDto deleteSkillPost(String id) {
        log.info("deleteSkillPost: Deleting post with id {}", id);
        repository.deleteById(id);
        return new ResponseDto(false, "Deleted successfully");
    }
}