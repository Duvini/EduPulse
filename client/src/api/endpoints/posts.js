import apiClient from '../../services/apiClient';

const API_URL = '/api/v1/skillposts';

/**
 * Posts API endpoints
 */
export const postsApi = {
  /**
   * Get all posts
   */
  getAll: async () => {
    const response = await apiClient.get(API_URL);
    return response.data.data || [];
  },

  /**
   * Get posts by user ID
   */
  getByUserId: async (userId) => {
    const response = await apiClient.get(`${API_URL}/user/${userId}`);
    return response.data.data || [];
  },

  /**
   * Get post by ID
   */
  getById: async (id) => {
    const response = await apiClient.get(`${API_URL}/${id}`);
    return response.data.data;
  },

  /**
   * Create a new post
   */
  create: async ({ description, tags, mediaFiles }) => {
    const formData = new FormData();
    formData.append('description', description);
    
    if (tags && Array.isArray(tags)) {
      tags.forEach(tag => formData.append('tags', tag));
    }
    
    if (mediaFiles) {
      Array.from(mediaFiles).forEach(file => formData.append('mediaFiles', file));
    }

    const response = await apiClient.post(API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
    });
    
    return response.data;
  },

  /**
   * Update an existing post
   */
  update: async ({ id, description, tags, mediaFiles }) => {
    const formData = new FormData();
    
    if (description !== undefined) {
      formData.append('description', description);
    }
    
    if (tags && Array.isArray(tags)) {
      tags.forEach(tag => formData.append('tags', tag));
    }
    
    if (mediaFiles && mediaFiles.length > 0) {
      Array.from(mediaFiles).forEach(file => formData.append('mediaFiles', file));
    }

    const response = await apiClient.put(`${API_URL}/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
    });
    
    return response.data;
  },

  /**
   * Delete a post
   */
  remove: async (id) => {
    const response = await apiClient.delete(`${API_URL}/${id}`);
    return response.status === 204 ? null : response.data;
  },
  
  /**
   * Like a post
   */
  like: async (id) => {
    const response = await apiClient.post(`${API_URL}/${id}/like`);
    return response.data;
  },
  
  /**
   * Unlike a post
   */
  unlike: async (id) => {
    const response = await apiClient.delete(`${API_URL}/${id}/like`);
    return response.data;
  },
  
  /**
   * Save a post
   */
  save: async (id) => {
    const response = await apiClient.post(`${API_URL}/${id}/save`);
    return response.data;
  },
  
  /**
   * Unsave a post
   */
  unsave: async (id) => {
    const response = await apiClient.delete(`${API_URL}/${id}/save`);
    return response.data;
  }
};