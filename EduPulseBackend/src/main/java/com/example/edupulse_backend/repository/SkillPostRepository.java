package com.example.edupulse_backend.repository;

import com.example.edupulse_backend.model.SkillPost;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface SkillPostRepository extends MongoRepository<SkillPost, String> {
    List<SkillPost> findByUserId(String userId);
    List<SkillPost> findByUserIdIn(List<String> userIds);
}