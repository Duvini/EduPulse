import apiClient from '../../services/apiClient';

const API_URL = '/api/v1/learning-progress';

/**
 * Learning Progress API endpoints
 */
export const learningProgressApi = {
  /**
   * Get learning progress for current user
   */
  getProgress: async () => {
    const response = await apiClient.get(`${API_URL}`);
    return response.data.data || [];
  },

  /**
   * Get learning progress for a specific user
   */
  getUserProgress: async (userId) => {
    const response = await apiClient.get(`${API_URL}/user/${userId}`);
    return response.data.data || [];
  },

  /**
   * Create new learning item
   */
  createLearningItem: async (learningData) => {
    const response = await apiClient.post(`${API_URL}`, learningData);
    return response.data;
  },

  /**
   * Update learning item
   */
  updateLearningItem: async ({ id, ...updateData }) => {
    const response = await apiClient.put(`${API_URL}/${id}`, updateData);
    return response.data;
  },

  /**
   * Delete learning item
   */
  deleteLearningItem: async (id) => {
    const response = await apiClient.delete(`${API_URL}/${id}`);
    return response.data;
  },

  /**
   * Get learning item by ID
   */
  getLearningItemById: async (id) => {
    const response = await apiClient.get(`${API_URL}/${id}`);
    return response.data.data;
  },

  /**
   * Update learning progress status
   */
  updateProgressStatus: async ({ id, status }) => {
    const response = await apiClient.put(`${API_URL}/${id}/status`, { status });
    return response.data;
  },

  /**
   * Get learning progress statistics
   */
  getProgressStats: async () => {
    const response = await apiClient.get(`${API_URL}/stats`);
    return response.data.data;
  }
};