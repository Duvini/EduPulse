import apiClient from '../../services/apiClient';

const API_URL = '/api/v1/followers';

/**
 * Followers API endpoints
 */
export const followersApi = {
  /**
   * Get followers of a user
   */
  getFollowers: async (userId) => {
    const response = await apiClient.get(`${API_URL}/user/${userId}/followers`);
    return response.data.data || [];
  },

  /**
   * Get users that a user is following
   */
  getFollowing: async (userId) => {
    const response = await apiClient.get(`${API_URL}/user/${userId}/following`);
    return response.data.data || [];
  },

  /**
   * Follow a user
   */
  followUser: async (userId) => {
    const response = await apiClient.post(`${API_URL}/follow/${userId}`);
    return response.data;
  },

  /**
   * Unfollow a user
   */
  unfollowUser: async (userId) => {
    const response = await apiClient.delete(`${API_URL}/unfollow/${userId}`);
    return response.data;
  },

  /**
   * Check if user follows another user
   */
  checkFollowing: async (userId) => {
    const response = await apiClient.get(`${API_URL}/check-following/${userId}`);
    return response.data;
  },

  /**
   * Get follower statistics
   */
  getStats: async (userId) => {
    const response = await apiClient.get(`${API_URL}/stats/${userId}`);
    return response.data;
  }
};