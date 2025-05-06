package com.example.edupulse_backend.repository;

import com.example.edupulse_backend.model.Follower;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface FollowerRepository extends MongoRepository<Follower, String> {
    List<Follower> findByFollowerId(String followerId);
    List<Follower> findByFollowingId(String followingId);
    Optional<Follower> findByFollowerIdAndFollowingId(String followerId, String followingId);
    boolean existsByFollowerIdAndFollowingId(String followerId, String followingId);
    void deleteByFollowerIdAndFollowingId(String followerId, String followingId);
    long countByFollowerId(String followerId);
    long countByFollowingId(String followingId);
}