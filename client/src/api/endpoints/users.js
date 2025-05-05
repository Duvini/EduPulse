import apiClient from '../../services/apiClient';

const API_URL = '/api/v1/users';

/**
 * Users API endpoints
 */
export const usersApi = {
  /**
   * Get current user profile
   */
  getCurrentUser: async () => {
    const response = await apiClient.get(`${API_URL}/me`);
    return response.data.data;
  },

  /**
   * Get user by ID
   */
  getUserById: async (userId) => {
    const response = await apiClient.get(`${API_URL}/${userId}`);
    return response.data.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (userData) => {
    // Handle case when profile photo is included (needs FormData)
    if (userData.profilePhoto) {
      const formData = new FormData();
      
      // Add all user data to form data
      Object.keys(userData).forEach(key => {
        if (key === 'profilePhoto' && userData[key] instanceof File) {
          formData.append(key, userData[key]);
        } else if (key !== 'profilePhoto') {
          formData.append(key, userData[key]);
        }
      });
      
      const response = await apiClient.put(`${API_URL}/profile`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }
    
    // Regular JSON update if no profile photo
    const response = await apiClient.put(`${API_URL}/profile`, userData);
    return response.data;
  },

  /**
   * Search for users
   */
  searchUsers: async (query) => {
    const response = await apiClient.get(`${API_URL}/search?q=${encodeURIComponent(query)}`);
    return response.data.data || [];
  },

  /**
   * Get recommended users to follow
   */
  getRecommendedUsers: async () => {
    const response = await apiClient.get(`${API_URL}/recommended`);
    return response.data.data || [];
  },

  /**
   * Update user settings
   */
  updateSettings: async (settings) => {
    const response = await apiClient.put(`${API_URL}/settings`, settings);
    return response.data;
  },
  
  /**
   * Get user settings
   */
  getSettings: async () => {
    const response = await apiClient.get(`${API_URL}/settings`);
    return response.data.data;
  }
};