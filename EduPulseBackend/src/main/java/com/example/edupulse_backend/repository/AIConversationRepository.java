package com.example.edupulse_backend.repository;

import com.example.edupulse_backend.model.AIConversation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AIConversationRepository extends MongoRepository<AIConversation, String> {
    
    List<AIConversation> findByUserId(String userId);
    
    List<AIConversation> findByIsPublicTrue();
    
    List<AIConversation> findByUserIdAndIsPublicTrue(String userId);
    
    List<AIConversation> findByRelatedLearningPlanIdsContaining(String planId);
}