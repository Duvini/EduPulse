package com.example.edupulse_backend.service.impl;

import com.example.edupulse_backend.exception.ResourceNotFoundException;
import com.example.edupulse_backend.model.Follower;
import com.example.edupulse_backend.model.User;
import com.example.edupulse_backend.payload.response.ResponseDto;
import com.example.edupulse_backend.repository.FollowerRepository;
import com.example.edupulse_backend.repository.UserRepository;
import com.example.edupulse_backend.service.FollowerService;
import com.example.edupulse_backend.util.NotificationHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FollowerServiceImpl implements FollowerService {

    private final FollowerRepository followerRepository;
    private final UserRepository userRepository;
    private final NotificationHandler notificationHandler;

    @Override
    public ResponseDto followUser(String followingId, Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return new ResponseDto(true, "Authentication required");
        }

        try {
            UserDetails userDetails = (UserDetails) auth.getPrincipal();
            User follower = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            if (follower.getId().equals(followingId)) {
                return new ResponseDto(true, "Users cannot follow themselves");
            }

            User following = userRepository.findById(followingId)
                    .orElseThrow(() -> new ResourceNotFoundException("User to follow not found"));

            // Check if already following
            if (followerRepository.existsByFollowerIdAndFollowingId(follower.getId(), followingId)) {
                return new ResponseDto(true, "Already following this user");
            }

            // Create follow relationship
            Follower newFollower = new Follower(follower.getId(), followingId);
            followerRepository.save(newFollower);

            // Send notification to the user being followed
            notificationHandler.sendFollowNotification(
                followingId,         // recipientId
                follower.getId(),    // senderId
                follower.getName()   // senderName
            );

            Map<String, Object> response = new HashMap<>();
            response.put("followersCount", followerRepository.countByFollowingId(followingId));
            response.put("followingCount", followerRepository.countByFollowerId(followingId));

            return new ResponseDto(false, response);
        } catch (Exception e) {
            log.error("Error in followUser: ", e);
            return new ResponseDto(true, "Error following user: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto unfollowUser(String followingId, Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return new ResponseDto(true, "Authentication required");
        }

        try {
            UserDetails userDetails = (UserDetails) auth.getPrincipal();
            User follower = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            if (!followerRepository.existsByFollowerIdAndFollowingId(follower.getId(), followingId)) {
                return new ResponseDto(true, "Not following this user");
            }

            followerRepository.deleteByFollowerIdAndFollowingId(follower.getId(), followingId);

            Map<String, Object> response = new HashMap<>();
            response.put("followersCount", followerRepository.countByFollowingId(followingId));
            response.put("followingCount", followerRepository.countByFollowerId(followingId));

            return new ResponseDto(false, response);
        } catch (Exception e) {
            log.error("Error in unfollowUser: ", e);
            return new ResponseDto(true, "Error unfollowing user: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto getFollowers(String userId) {
        try {
            List<Follower> followers = followerRepository.findByFollowingId(userId);
            List<Map<String, Object>> followerDetails = followers.stream()
                .map(follower -> {
                    User user = userRepository.findById(follower.getFollowerId())
                        .orElseThrow(() -> new ResourceNotFoundException("Follower not found"));
                    Map<String, Object> details = new HashMap<>();
                    details.put("id", user.getId());
                    details.put("username", user.getUsername());
                    details.put("name", user.getName());
                    details.put("profilePicture", user.getProfilePicture());
                    details.put("followedAt", follower.getCreatedAt());
                    return details;
                })
                .collect(Collectors.toList());

            return new ResponseDto(false, followerDetails);
        } catch (Exception e) {
            log.error("Error in getFollowers: ", e);
            return new ResponseDto(true, "Error getting followers: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto getFollowing(String userId) {
        try {
            List<Follower> following = followerRepository.findByFollowerId(userId);
            List<Map<String, Object>> followingDetails = following.stream()
                .map(follow -> {
                    User user = userRepository.findById(follow.getFollowingId())
                        .orElseThrow(() -> new ResourceNotFoundException("Following user not found"));
                    Map<String, Object> details = new HashMap<>();
                    details.put("id", user.getId());
                    details.put("username", user.getUsername());
                    details.put("name", user.getName());
                    details.put("profilePicture", user.getProfilePicture());
                    details.put("followedAt", follow.getCreatedAt());
                    return details;
                })
                .collect(Collectors.toList());

            return new ResponseDto(false, followingDetails);
        } catch (Exception e) {
            log.error("Error in getFollowing: ", e);
            return new ResponseDto(true, "Error getting following: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto getFollowStats(String userId) {
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("followersCount", followerRepository.countByFollowingId(userId));
            stats.put("followingCount", followerRepository.countByFollowerId(userId));
            return new ResponseDto(false, stats);
        } catch (Exception e) {
            log.error("Error in getFollowStats: ", e);
            return new ResponseDto(true, "Error getting follow stats: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto getFollowStatus(String userId, Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return new ResponseDto(true, "Authentication required");
        }

        try {
            UserDetails userDetails = (UserDetails) auth.getPrincipal();
            User currentUser = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            boolean isFollowing = followerRepository.existsByFollowerIdAndFollowingId(
                currentUser.getId(), userId);

            return new ResponseDto(false, isFollowing);
        } catch (Exception e) {
            log.error("Error in getFollowStatus: ", e);
            return new ResponseDto(true, "Error getting follow status: " + e.getMessage());
        }
    }
}