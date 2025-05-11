package com.example.edupulse_backend.controller;

import com.example.edupulse_backend.model.AIConversation;
import com.example.edupulse_backend.payload.response.ResponseDto;
import com.example.edupulse_backend.service.AIAssistantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin
@RestController
@RequestMapping("/api/v1/ai-assistant")
@RequiredArgsConstructor
public class AIAssistantController {

    private final AIAssistantService aiAssistantService;

    @PostMapping("/ask")
    public ResponseEntity<ResponseDto> askQuestion(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        
        String question = (String) request.get("question");
        String conversationId = (String) request.get("conversationId");
        @SuppressWarnings("unchecked")
        List<String> relatedLearningPlanIds = (List<String>) request.get("relatedLearningPlanIds");
        
        ResponseDto response = aiAssistantService.askQuestion(question, conversationId, relatedLearningPlanIds, authentication);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/conversation")
    public ResponseEntity<ResponseDto> createConversation(
            @RequestBody AIConversation conversation,
            Authentication authentication) {
        
        ResponseDto response = aiAssistantService.createConversation(conversation, authentication);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/conversation/{id}")
    public ResponseEntity<ResponseDto> getConversation(
            @PathVariable("id") String conversationId,
            Authentication authentication) {
        
        ResponseDto response = aiAssistantService.getConversation(conversationId, authentication);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/conversations")
    public ResponseEntity<ResponseDto> getUserConversations(Authentication authentication) {
        ResponseDto response = aiAssistantService.getUserConversations(authentication);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/public-conversations")
    public ResponseEntity<ResponseDto> getPublicConversations() {
        ResponseDto response = aiAssistantService.getAllPublicConversations();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PatchMapping("/conversation/{id}")
    public ResponseEntity<ResponseDto> updateConversation(
            @PathVariable("id") String conversationId,
            @RequestBody AIConversation updates,
            Authentication authentication) {
        
        ResponseDto response = aiAssistantService.updateConversation(conversationId, updates, authentication);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @DeleteMapping("/conversation/{id}")
    public ResponseEntity<ResponseDto> deleteConversation(
            @PathVariable("id") String conversationId,
            Authentication authentication) {
        
        ResponseDto response = aiAssistantService.deleteConversation(conversationId, authentication);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PatchMapping("/conversation/{id}/toggle-public")
    public ResponseEntity<ResponseDto> togglePublicStatus(
            @PathVariable("id") String conversationId,
            Authentication authentication) {
        
        ResponseDto response = aiAssistantService.togglePublicStatus(conversationId, authentication);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/conversation/{id}/upvote")
    public ResponseEntity<ResponseDto> upvoteConversation(
            @PathVariable("id") String conversationId,
            Authentication authentication) {
        
        ResponseDto response = aiAssistantService.upvoteConversation(conversationId, authentication);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/conversations/learning-plan/{planId}")
    public ResponseEntity<ResponseDto> getConversationsByLearningPlan(
            @PathVariable String planId) {
        
        ResponseDto response = aiAssistantService.getConversationsByLearningPlan(planId);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}