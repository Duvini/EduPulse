package com.example.edupulse_backend.service;

import com.example.edupulse_backend.model.AIConversation;
import com.example.edupulse_backend.payload.response.ResponseDto;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface AIAssistantService {
    
    ResponseDto askQuestion(String question, String conversationId, List<String> relatedLearningPlanIds, Authentication auth);
    
    ResponseDto createConversation(AIConversation conversation, Authentication auth);
    
    ResponseDto getConversation(String conversationId, Authentication auth);
    
    ResponseDto getUserConversations(Authentication auth);
    
    ResponseDto getAllPublicConversations();
    
    ResponseDto updateConversation(String conversationId, AIConversation updates, Authentication auth);
    
    ResponseDto deleteConversation(String conversationId, Authentication auth);
    
    ResponseDto togglePublicStatus(String conversationId, Authentication auth);
    
    ResponseDto upvoteConversation(String conversationId, Authentication auth);
    
    ResponseDto getConversationsByLearningPlan(String planId);
}