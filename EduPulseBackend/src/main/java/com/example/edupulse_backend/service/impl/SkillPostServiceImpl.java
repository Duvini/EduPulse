package com.example.edupulse_backend.service.impl;

import com.example.edupulse_backend.exception.ResourceNotFoundException;
import com.example.edupulse_backend.model.SkillPost;
import com.example.edupulse_backend.model.User;
import com.example.edupulse_backend.payload.response.ResponseDto;
import com.example.edupulse_backend.repository.SkillPostRepository;
import com.example.edupulse_backend.repository.UserRepository;
import com.example.edupulse_backend.service.MediaStorageService;
import com.example.edupulse_backend.service.SkillPostService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class SkillPostServiceImpl implements SkillPostService {

    private final SkillPostRepository repository;
    private final UserRepository userRepository;
    private final MediaStorageService mediaStorageService;

    @Override
    public ResponseDto createSkillPost(Authentication auth, String description, List<String> tags, MultipartFile[] files) {
        // Check if authentication is valid
        if (auth == null || !auth.isAuthenticated()) {
            log.warn("createSkillPost: Authentication is missing or invalid");
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
            
            log.info("createSkillPost: Creating post for userId {}", userId);
            
            // Save media files
            List<String> mediaUrls = mediaStorageService.saveMediaFiles(files);
        
            // Create and save the skill post
            SkillPost post = SkillPost.builder()
                    .userId(userId)
                    .userName(userName)
                    .profilePhotoUrl(user.getProfilePicture())
                    .description(description)
                    .tags(tags)
                    .mediaUrls(mediaUrls)
                    .build();
        
            SkillPost saved = repository.save(post);
            log.info("createSkillPost: Saved post with ID {} for user {}", saved.getId(), saved.getUserId());
        
            return new ResponseDto(false, saved);
        } catch (Exception e) {
            log.error("Error in createSkillPost: ", e);
            return new ResponseDto(true, "Error creating post: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto getPostsByUserId(String userId) {
        if (userId == null || userId.isEmpty()) {
            log.warn("getPostsByUserId: Received null or empty userId");
            return new ResponseDto(true, "User ID cannot be null or empty");
        }
        
        log.info("getPostsByUserId: Fetching posts for userId {}", userId);
        List<SkillPost> posts = repository.findByUserId(userId);
        
        log.info("getPostsByUserId: Found {} posts for user {}", posts.size(), userId);
        
        return new ResponseDto(false, posts);
    }

    @Override
    public ResponseDto getPostsByFollowedUserIds(List<String> followedUserIds) {
        log.info("getPostsByFollowedUserIds: Fetching posts for followed user IDs {}", followedUserIds);
        return new ResponseDto(false, repository.findByUserIdIn(followedUserIds));
    }

        @Override
    public ResponseDto updateSkillPostWithFiles(String id, String description, List<String> tags, 
                                               MultipartFile[] files, Authentication auth) {
        log.info("updateSkillPostWithFiles: Updating post with id {}", id);
        
        if (auth == null || !auth.isAuthenticated()) {
            log.warn("updateSkillPostWithFiles: Authentication is missing or invalid");
            return new ResponseDto(true, "Authentication required");
        }
        
        try {
            // Check if post exists
            Optional<SkillPost> optionalPost = repository.findById(id);
            if (optionalPost.isEmpty()) {
                log.warn("updateSkillPostWithFiles: Post with id {} not found", id);
                return new ResponseDto(true, "Post not found with id: " + id);
            }
            
            // Get current user
            UserDetails userDetails = (UserDetails) auth.getPrincipal();
            User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            
            // Get existing post
            SkillPost existingPost = optionalPost.get();
            
            // Verify ownership - only post owner can update
            if (!existingPost.getUserId().equals(currentUser.getId())) {
                log.warn("updateSkillPostWithFiles: User {} is not authorized to update post {}", 
                    currentUser.getId(), id);
                return new ResponseDto(true, "You are not authorized to update this post");
            }
            
            // Update fields if provided
            if (description != null) {
                existingPost.setDescription(description);
            }
            
            if (tags != null && !tags.isEmpty()) {
                existingPost.setTags(tags);
            }
            
            // Handle file uploads if provided
            if (files != null && files.length > 0 && files[0].getSize() > 0) {
                List<String> mediaUrls = mediaStorageService.saveMediaFiles(files);
                existingPost.setMediaUrls(mediaUrls);
            }
            
            SkillPost saved = repository.save(existingPost);
            log.info("updateSkillPostWithFiles: Successfully updated post with id {}", id);
            
            return new ResponseDto(false, saved);
        } catch (Exception e) {
            log.error("Error in updateSkillPostWithFiles: ", e);
            return new ResponseDto(true, "Error updating post: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto deleteSkillPost(String id, Authentication auth) {
        log.info("deleteSkillPost: Deleting post with id {}", id);
        
        if (auth == null || !auth.isAuthenticated()) {
            log.warn("deleteSkillPost: Authentication is missing or invalid");
            return new ResponseDto(true, "Authentication required");
        }
        
        try {
            // Check if post exists
            Optional<SkillPost> optionalPost = repository.findById(id);
            if (optionalPost.isEmpty()) {
                log.warn("deleteSkillPost: Post with id {} not found", id);
                return new ResponseDto(true, "Post not found with id: " + id);
            }
            
            // Get current user
            UserDetails userDetails = (UserDetails) auth.getPrincipal();
            User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            
            // Get existing post
            SkillPost existingPost = optionalPost.get();
            
            // Verify ownership - only post owner can delete
            if (!existingPost.getUserId().equals(currentUser.getId())) {
                log.warn("deleteSkillPost: User {} is not authorized to delete post {}", 
                    currentUser.getId(), id);
                return new ResponseDto(true, "You are not authorized to delete this post");
            }
            
            repository.deleteById(id);
            log.info("deleteSkillPost: Successfully deleted post with id {}", id);
            return new ResponseDto(false, "Post deleted successfully");
        } catch (Exception e) {
            log.error("Error in deleteSkillPost: ", e);
            return new ResponseDto(true, "Error deleting post: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto getAllSkillPosts() {
        log.info("getAllSkillPosts: Fetching all skill posts");
        List<SkillPost> posts = repository.findAll();
        
        log.info("getAllSkillPosts: Found {} posts", posts.size());
        
        if (posts.isEmpty()) {
            log.info("getAllSkillPosts: No posts found in the database");
        }
        
        return new ResponseDto(false, posts);
    }
}