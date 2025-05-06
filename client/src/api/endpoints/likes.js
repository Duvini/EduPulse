import apiClient from '../../services/apiClient';

const API_URL = '/api/v1/likes';

/**
 * Likes API endpoints
 */
export const likesApi = {
  /**
   * Get likes for a post
   */
  getLikes: async (postId) => {
    const response = await apiClient.get(`${API_URL}/post/${postId}`);
    return response.data.data || [];
  },

  /**
   * Like a post
   */
  likePost: async (postId) => {
    const response = await apiClient.post(`${API_URL}/post/${postId}`);
    return response.data;
  },

  /**
   * Unlike a post
   */
  unlikePost: async (postId) => {
    const response = await apiClient.delete(`${API_URL}/post/${postId}`);
    return response.data;
  },

  /**
   * Check if user has liked a post
   */
  checkLiked: async (postId) => {
    const response = await apiClient.get(`${API_URL}/check/${postId}`);
    return response.data;
  },

  /**
   * Get like count for a post
   */
  getLikeCount: async (postId) => {
    const response = await apiClient.get(`${API_URL}/count/${postId}`);
    return response.data;
  }
};