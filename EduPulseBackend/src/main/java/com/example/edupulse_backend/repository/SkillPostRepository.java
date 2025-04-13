package com.example.edupulse_backend.repository;

import com.example.edupulse_backend.model.SkillPost;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface SkillPostRepository extends MongoRepository<SkillPost, String> {
}
