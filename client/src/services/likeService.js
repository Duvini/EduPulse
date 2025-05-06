import axiosInstance from './axiosConfig';

const API_URL = '/api/v1/likes';

export const likeService = {
  /**
   * Toggle like status for a post
   * @param {string} postId - ID of the post to toggle like
   */
  toggleLike: async (postId) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/toggle/${postId}`);
      return { error: false, data: response.data.data };
    } catch (err) {
      console.error('Error toggling like:', err);
      if (err.response?.status === 401) {
        return { error: true, message: 'Please sign in to like posts' };
      }
      return { error: true, message: err.response?.data?.message || 'Error toggling like' };
    }
  },

  /**
   * Get likes for a specific post
   * @param {string} postId - ID of the post
   */
  getLikes: async (postId) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/post/${postId}`);
      return { error: false, data: response.data.data };
    } catch (err) {
      console.error('Error fetching likes:', err);
      return { error: true, message: err.response?.data?.message || 'Error fetching likes' };
    }
  },

  /**
   * Check if the current user has liked a post
   * @param {string} postId - ID of the post
   */
  getLikeStatus: async (postId) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/status/${postId}`);
      return { error: false, data: response.data.data };
    } catch (err) {
      console.error('Error checking like status:', err);
      return { error: true, message: err.response?.data?.message || 'Error checking like status' };
    }
  },

  /**
   * Get like count for a specific post
   * @param {string} postId - ID of the post
   */
  getLikeCount: async (postId) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/count/${postId}`);
      return { error: false, data: response.data.data };
    } catch (err) {
      console.error('Error fetching like count:', err);
      return { error: true, message: err.response?.data?.message || 'Error fetching like count' };
    }
  }
};