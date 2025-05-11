package com.example.edupulse_backend.service.impl;

import com.example.edupulse_backend.model.AIConversation;
import com.example.edupulse_backend.model.User;
import com.example.edupulse_backend.payload.response.ResponseDto;
import com.example.edupulse_backend.repository.AIConversationRepository;
import com.example.edupulse_backend.repository.UserRepository;
import com.example.edupulse_backend.service.AIAssistantService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

@Service
@Slf4j
public class AIAssistantServiceImpl implements AIAssistantService {

    private final AIConversationRepository aiConversationRepository;
    private final UserRepository userRepository;
    private final RestTemplate openAiRestTemplate;

    @Value("${app.openai.api-key:}")
    private String openaiApiKey;

    @Value("${app.openai.model:gpt-3.5-turbo}")
    private String openaiModel;

    public AIAssistantServiceImpl(
            AIConversationRepository aiConversationRepository,
            UserRepository userRepository,
            @Qualifier("openAiRestTemplate") RestTemplate openAiRestTemplate) {
        this.aiConversationRepository = aiConversationRepository;
        this.userRepository = userRepository;
        this.openAiRestTemplate = openAiRestTemplate;
    }

    @Override
    public ResponseDto askQuestion(String question, String conversationId, List<String> relatedLearningPlanIds, Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return new ResponseDto(true, "Authentication required");
        }

        try {
            UserDetails userDetails = (UserDetails) auth.getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            AIConversation conversation;

            // Get existing conversation or create a new one
            if (conversationId != null && !conversationId.isEmpty()) {
                conversation = aiConversationRepository.findById(conversationId)
                        .orElseThrow(() -> new RuntimeException("Conversation not found"));

                // Check if user owns this conversation
                if (!conversation.getUserId().equals(user.getId())) {
                    return new ResponseDto(true, "You don't have permission to modify this conversation");
                }
            } else {
                conversation = new AIConversation();
                conversation.setUserId(user.getId());
                conversation.setTitle(question.length() > 30 ? question.substring(0, 27) + "..." : question);
                conversation.setCreatedAt(LocalDateTime.now());
                conversation.setPublic(false);

                if (relatedLearningPlanIds != null && !relatedLearningPlanIds.isEmpty()) {
                    conversation.setRelatedLearningPlanIds(relatedLearningPlanIds);
                }
            }

            // Add user message
            AIConversation.Message userMessage = new AIConversation.Message();
            userMessage.setRole("user");
            userMessage.setContent(question);
            userMessage.setTimestamp(LocalDateTime.now());
            conversation.getMessages().add(userMessage);

            // Call OpenAI API to get response
            String aiResponse = getAIResponse(conversation.getMessages());

            // Add AI response
            AIConversation.Message aiMessage = new AIConversation.Message();
            aiMessage.setRole("assistant");
            aiMessage.setContent(aiResponse);
            aiMessage.setTimestamp(LocalDateTime.now());
            conversation.getMessages().add(aiMessage);

            // Update conversation
            conversation.setUpdatedAt(LocalDateTime.now());
            AIConversation savedConversation = aiConversationRepository.save(conversation);

            return new ResponseDto(false, savedConversation);
        } catch (Exception e) {
            log.error("Error asking question: " + e.getMessage(), e);
            return new ResponseDto(true, "Error processing question: " + e.getMessage());
        }
    }

    private String getAIResponse(List<AIConversation.Message> messages) {
        // Simple mock implementation when OpenAI key not configured
        if (openaiApiKey == null || openaiApiKey.isBlank()) {
            log.warn("OpenAI API key not configured. Using mock response.");
            return "I'm your AI learning assistant. This is a mock response as the OpenAI API is not configured. In production, I would provide a helpful answer to your question based on the context of your learning materials.";
        }

        try {
            // Format messages for OpenAI API
            List<Map<String, String>> formattedMessages = new ArrayList<>();
            for (AIConversation.Message message : messages) {
                Map<String, String> formattedMessage = new HashMap<>();
                formattedMessage.put("role", message.getRole());
                formattedMessage.put("content", message.getContent());
                formattedMessages.add(formattedMessage);
            }

            // Add system message for context
            Map<String, String> systemMessage = new HashMap<>();
            systemMessage.put("role", "system");
            systemMessage.put("content", "You are an AI learning assistant for the EduPulse platform. Your goal is to help users learn by providing clear, accurate, and educational responses. Keep responses educational, friendly, and concise.");
            formattedMessages.add(0, systemMessage);

            // Prepare request to OpenAI API
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Handle different API key formats
            if (openaiApiKey.startsWith("sk-proj-")) {
                // Project API key format used in newer OpenAI Organizations
                log.info("Using project-based API key format");
                headers.setBearerAuth(openaiApiKey);
            } else {
                headers.setBearerAuth(openaiApiKey);
            }

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", openaiModel);
            requestBody.put("messages", formattedMessages);
            requestBody.put("max_tokens", 1000);
            requestBody.put("temperature", 0.7);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            // Log the request details (excluding sensitive data)
            log.info("Sending request to OpenAI API with model: {}", openaiModel);

            // Standard OpenAI API endpoint
            String apiEndpoint = "https://api.openai.com/v1/chat/completions";

            log.debug("API Request Body: {}", requestBody);
            ResponseEntity<Map> response = openAiRestTemplate.postForEntity(apiEndpoint, request, Map.class);
            log.info("OpenAI API response status: {}", response.getStatusCode());

            // Process the response
            Map<String, Object> responseBody = response.getBody();
            if (responseBody == null) {
                log.error("Empty response body from OpenAI API");
                return "I apologize, but I received an empty response from the AI service.";
            }

            log.debug("Response body: {}", responseBody);

            List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
            if (choices == null || choices.isEmpty()) {
                log.error("No choices in response: {}", responseBody);
                return "I apologize, but the AI service didn't provide a valid response.";
            }

            Map<String, String> message = (Map<String, String>) choices.get(0).get("message");
            if (message == null) {
                log.error("No message in response choice: {}", choices.get(0));
                return "I apologize, but the AI service response was missing the message content.";
            }

            String content = message.get("content");
            return content != null ? content : "I apologize, but I received an empty response.";
        } catch (Exception e) {
            log.error("Error calling OpenAI API: {}", e.getMessage(), e);
            // More detailed error message for debugging
            String errorMessage = "I apologize, but I'm having trouble generating a response right now. ";
            if (e.getMessage() != null) {
                if (e.getMessage().contains("401")) {
                    errorMessage += "There seems to be an authentication issue with the AI service.";
                    log.error("API Key authentication failure. Key prefix: {}",
                            openaiApiKey.substring(0, Math.min(8, openaiApiKey.length())));
                } else if (e.getMessage().contains("429")) {
                    errorMessage += "The AI service is currently experiencing high demand or rate limits.";
                } else if (e.getMessage().contains("Connection timed out")) {
                    errorMessage += "The connection to the AI service timed out. This may be due to network issues or service unavailability.";
                } else {
                    errorMessage += "Please try again later. Error type: " + e.getClass().getSimpleName();
                }
            }
            return errorMessage;
        }
    }

    @Override
    public ResponseDto createConversation(AIConversation conversation, Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return new ResponseDto(true, "Authentication required");
        }

        try {
            UserDetails userDetails = (UserDetails) auth.getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            conversation.setUserId(user.getId());
            conversation.setCreatedAt(LocalDateTime.now());
            conversation.setUpdatedAt(LocalDateTime.now());

            AIConversation savedConversation = aiConversationRepository.save(conversation);
            return new ResponseDto(false, savedConversation);
        } catch (Exception e) {
            log.error("Error creating conversation: " + e.getMessage(), e);
            return new ResponseDto(true, "Error creating conversation: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto getConversation(String conversationId, Authentication auth) {
        try {
            AIConversation conversation = aiConversationRepository.findById(conversationId)
                    .orElseThrow(() -> new RuntimeException("Conversation not found"));

            if (auth != null && auth.isAuthenticated()) {
                UserDetails userDetails = (UserDetails) auth.getPrincipal();
                User user = userRepository.findByUsername(userDetails.getUsername())
                        .orElseThrow(() -> new RuntimeException("User not found"));

                // Check if user can access this conversation
                if (conversation.getUserId().equals(user.getId()) || conversation.isPublic()) {
                    return new ResponseDto(false, conversation);
                }
            } else if (conversation.isPublic()) {
                return new ResponseDto(false, conversation);
            }

            return new ResponseDto(true, "You don't have permission to view this conversation");
        } catch (Exception e) {
            log.error("Error getting conversation: " + e.getMessage(), e);
            return new ResponseDto(true, "Error getting conversation: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto getUserConversations(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return new ResponseDto(true, "Authentication required");
        }

        try {
            UserDetails userDetails = (UserDetails) auth.getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<AIConversation> conversations = aiConversationRepository.findByUserId(user.getId());
            return new ResponseDto(false, conversations);
        } catch (Exception e) {
            log.error("Error getting user conversations: " + e.getMessage(), e);
            return new ResponseDto(true, "Error getting user conversations: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto getAllPublicConversations() {
        try {
            List<AIConversation> conversations = aiConversationRepository.findByIsPublicTrue();
            return new ResponseDto(false, conversations);
        } catch (Exception e) {
            log.error("Error getting public conversations: " + e.getMessage(), e);
            return new ResponseDto(true, "Error getting public conversations: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto updateConversation(String conversationId, AIConversation updates, Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return new ResponseDto(true, "Authentication required");
        }

        try {
            UserDetails userDetails = (UserDetails) auth.getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            AIConversation conversation = aiConversationRepository.findById(conversationId)
                    .orElseThrow(() -> new RuntimeException("Conversation not found"));

            // Check if user owns this conversation
            if (!conversation.getUserId().equals(user.getId())) {
                return new ResponseDto(true, "You don't have permission to update this conversation");
            }

            // Update fields
            if (updates.getTitle() != null) {
                conversation.setTitle(updates.getTitle());
            }

            if (updates.getRelatedLearningPlanIds() != null) {
                conversation.setRelatedLearningPlanIds(updates.getRelatedLearningPlanIds());
            }

            conversation.setUpdatedAt(LocalDateTime.now());
            AIConversation savedConversation = aiConversationRepository.save(conversation);

            return new ResponseDto(false, savedConversation);
        } catch (Exception e) {
            log.error("Error updating conversation: " + e.getMessage(), e);
            return new ResponseDto(true, "Error updating conversation: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto deleteConversation(String conversationId, Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return new ResponseDto(true, "Authentication required");
        }

        try {
            UserDetails userDetails = (UserDetails) auth.getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            AIConversation conversation = aiConversationRepository.findById(conversationId)
                    .orElseThrow(() -> new RuntimeException("Conversation not found"));

            // Check if user owns this conversation
            if (!conversation.getUserId().equals(user.getId())) {
                return new ResponseDto(true, "You don't have permission to delete this conversation");
            }

            aiConversationRepository.delete(conversation);
            return new ResponseDto(false, "Conversation deleted successfully");
        } catch (Exception e) {
            log.error("Error deleting conversation: " + e.getMessage(), e);
            return new ResponseDto(true, "Error deleting conversation: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto togglePublicStatus(String conversationId, Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return new ResponseDto(true, "Authentication required");
        }

        try {
            UserDetails userDetails = (UserDetails) auth.getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            AIConversation conversation = aiConversationRepository.findById(conversationId)
                    .orElseThrow(() -> new RuntimeException("Conversation not found"));

            // Check if user owns this conversation
            if (!conversation.getUserId().equals(user.getId())) {
                return new ResponseDto(true, "You don't have permission to update this conversation");
            }

            conversation.setPublic(!conversation.isPublic());
            conversation.setUpdatedAt(LocalDateTime.now());
            AIConversation savedConversation = aiConversationRepository.save(conversation);

            String status = savedConversation.isPublic() ? "public" : "private";
            return new ResponseDto(false, "Conversation is now " + status);
        } catch (Exception e) {
            log.error("Error toggling public status: " + e.getMessage(), e);
            return new ResponseDto(true, "Error toggling public status: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto upvoteConversation(String conversationId, Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return new ResponseDto(true, "Authentication required");
        }

        try {
            UserDetails userDetails = (UserDetails) auth.getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            AIConversation conversation = aiConversationRepository.findById(conversationId)
                    .orElseThrow(() -> new RuntimeException("Conversation not found"));

            // Check if conversation is public
            if (!conversation.isPublic()) {
                return new ResponseDto(true, "Cannot upvote a private conversation");
            }

            // Handle upvote toggle
            List<String> upvotedBy = conversation.getUpvotedBy();
            if (upvotedBy == null) {
                upvotedBy = new ArrayList<>();
                conversation.setUpvotedBy(upvotedBy);
            }

            boolean hasUpvoted = upvotedBy.contains(user.getId());

            if (hasUpvoted) {
                // Remove upvote
                upvotedBy.remove(user.getId());
                conversation.setUpvotes(conversation.getUpvotes() - 1);
            } else {
                // Add upvote
                upvotedBy.add(user.getId());
                conversation.setUpvotes(conversation.getUpvotes() + 1);
            }

            conversation.setUpdatedAt(LocalDateTime.now());
            AIConversation savedConversation = aiConversationRepository.save(conversation);

            String action = hasUpvoted ? "removed" : "added";
            return new ResponseDto(false, "Upvote " + action + " successfully");
        } catch (Exception e) {
            log.error("Error upvoting conversation: " + e.getMessage(), e);
            return new ResponseDto(true, "Error upvoting conversation: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto getConversationsByLearningPlan(String planId) {
        try {
            List<AIConversation> conversations = aiConversationRepository.findByRelatedLearningPlanIdsContaining(planId);
            // Filter to only return public conversations and those where isPublic is not set (backward compatibility)
            List<AIConversation> publicConversations = conversations.stream()
                    .filter(AIConversation::isPublic)
                    .toList();

            return new ResponseDto(false, publicConversations);
        } catch (Exception e) {
            log.error("Error getting conversations by learning plan: " + e.getMessage(), e);
            return new ResponseDto(true, "Error getting conversations by learning plan: " + e.getMessage());
        }
    }
}