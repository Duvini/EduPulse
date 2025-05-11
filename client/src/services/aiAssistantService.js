import apiClient from './apiClient';

const BASE_URL = '/api/v1/ai-assistant';

export const aiAssistantService = {
  // Ask a question to the AI assistant
  askQuestion: async (question, conversationId = null, relatedLearningPlanIds = []) => {
    try {
      const response = await apiClient.post(`${BASE_URL}/ask`, {
        question,
        conversationId,
        relatedLearningPlanIds
      });
      return response.data;
    } catch (error) {
      console.error('Error asking question:', error);
      throw error;
    }
  },

  // Get all conversations for the current user
  getUserConversations: async () => {
    try {
      const response = await apiClient.get(`${BASE_URL}/conversations`);
      return response.data;
    } catch (error) {
      console.error('Error getting user conversations:', error);
      throw error;
    }
  },

  // Get a specific conversation by ID
  getConversation: async (conversationId) => {
    try {
      const response = await apiClient.get(`${BASE_URL}/conversation/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting conversation:', error);
      throw error;
    }
  },

  // Get all public conversations
  getPublicConversations: async () => {
    try {
      const response = await apiClient.get(`${BASE_URL}/public-conversations`);
      return response.data;
    } catch (error) {
      console.error('Error getting public conversations:', error);
      throw error;
    }
  },

  // Update a conversation (title, related learning plans, etc.)
  updateConversation: async (conversationId, updates) => {
    try {
      const response = await apiClient.patch(`${BASE_URL}/conversation/${conversationId}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating conversation:', error);
      throw error;
    }
  },

  // Delete a conversation
  deleteConversation: async (conversationId) => {
    try {
      const response = await apiClient.delete(`${BASE_URL}/conversation/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  },

  // Toggle a conversation's public status
  togglePublicStatus: async (conversationId) => {
    try {
      const response = await apiClient.patch(`${BASE_URL}/conversation/${conversationId}/toggle-public`);
      return response.data;
    } catch (error) {
      console.error('Error toggling public status:', error);
      throw error;
    }
  },

  // Upvote a conversation
  upvoteConversation: async (conversationId) => {
    try {
      const response = await apiClient.post(`${BASE_URL}/conversation/${conversationId}/upvote`);
      return response.data;
    } catch (error) {
      console.error('Error upvoting conversation:', error);
      throw error;
    }
  },

  // Get conversations related to a learning plan
  getConversationsByLearningPlan: async (planId) => {
    try {
      const response = await apiClient.get(`${BASE_URL}/conversations/learning-plan/${planId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting conversations by learning plan:', error);
      throw error;
    }
  }
};

export default aiAssistantService;