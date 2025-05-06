import axiosInstance from './apiClient';

export const commentService = {
  // Get all comments for a post
  getComments: async (postId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/comments/post/${postId}`);
      return { data: response.data.data, error: false };
    } catch (error) {
      return { 
        error: true, 
        message: error.response?.data?.message || 'Failed to fetch comments'
      };
    }
  },
  
  // Add a new comment - Fixed to use query parameters instead of request body
  addComment: async (postId, content) => {
    try {
      // Convert to query parameters as required by backend
      const params = new URLSearchParams();
      params.append('postId', postId);
      params.append('content', content);
      
      const response = await axiosInstance.post(`/api/v1/comments?${params.toString()}`);
      return { data: response.data.data, error: false };
    } catch (error) {
      return { 
        error: true, 
        message: error.response?.data?.message || 'Failed to add comment'
      };
    }
  },
  
  // Delete a comment
  deleteComment: async (commentId) => {
    try {
      const response = await axiosInstance.delete(`/api/v1/comments/${commentId}`);
      return { data: response.data.data, error: false };
    } catch (error) {
      return { 
        error: true, 
        message: error.response?.data?.message || 'Failed to delete comment'
      };
    }
  },
  
  // Update a comment - Fixed to use query parameters
  updateComment: async (commentId, content) => {
    try {
      // Convert to query parameters as required by backend
      const params = new URLSearchParams();
      params.append('content', content);
      
      const response = await axiosInstance.put(`/api/v1/comments/${commentId}?${params.toString()}`);
      return { data: response.data.data, error: false };
    } catch (error) {
      return { 
        error: true, 
        message: error.response?.data?.message || 'Failed to update comment'
      };
    }
  },

  // Get comment count for a post by fetching all comments and counting them
  getCommentCount: async (postId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/comments/post/${postId}`);
      const count = Array.isArray(response.data.data) ? response.data.data.length : 0;
      return { data: count, error: false };
    } catch (error) {
      return { 
        error: true, 
        message: error.response?.data?.message || 'Failed to get comment count'
      };
    }
  }
};