import apiClient from '../../services/apiClient';

const API_URL = '/api/v1/comments';

/**
 * Comments API endpoints with improved error handling
 */
export const commentsApi = {
  /**
   * Get comments for a post
   */
  getComments: async (postId) => {
    try {
      const response = await apiClient.get(`${API_URL}/post/${postId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching comments for post ${postId}:`, error);
      throw error;
    }
  },

  /**
   * Add a comment to a post - Fixed to use query parameters
   */
  addComment: async (postId, content) => {
    try {
      // Using URLSearchParams to properly format query parameters
      const params = new URLSearchParams();
      params.append('postId', postId);
      params.append('content', content);
      
      const response = await apiClient.post(`${API_URL}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error(`Error adding comment to post ${postId}:`, error);
      throw error;
    }
  },

  /**
   * Update a comment - Fixed to use query parameters
   */
  updateComment: async (commentId, content) => {
    try {
      // Using URLSearchParams to properly format query parameters
      const params = new URLSearchParams();
      params.append('content', content);
      
      const response = await apiClient.put(`${API_URL}/${commentId}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error(`Error updating comment ${commentId}:`, error);
      throw error;
    }
  },

  /**
   * Delete a comment
   */
  deleteComment: async (commentId) => {
    try {
      const response = await apiClient.delete(`${API_URL}/${commentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting comment ${commentId}:`, error);
      throw error;
    }
  },
  
  /**
   * Get comment count for a post
   * Note: This endpoint isn't visible in the provided backend code
   * We should implement it server-side or use the comments list length
   */
  getCommentCount: async (postId) => {
    try {
      // Since there's no dedicated endpoint, we'll use getComments and count
      const response = await apiClient.get(`${API_URL}/post/${postId}`);
      if (response.data && !response.data.error && Array.isArray(response.data.data)) {
        return { data: response.data.data.length, error: false };
      }
      return { data: 0, error: false };
    } catch (error) {
      console.error(`Error fetching comment count for post ${postId}:`, error);
      throw error;
    }
  }
};