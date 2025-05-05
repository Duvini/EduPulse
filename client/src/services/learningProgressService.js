import axiosInstance from './axiosConfig';

export const learningProgressService = {
  getUserProgress: async (userId) => {
    try {
      // First try to get user-specific plans
      const userPlansResponse = await axiosInstance.get(`/api/v1/plans/user/${userId}`);
      if (!userPlansResponse.data.error) {
        return { data: userPlansResponse.data, error: null };
      }
      
      // Fallback to all plans if user-specific request fails
      const response = await axiosInstance.get('/api/v1/plans');
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error fetching learning progress:', error);
      return { 
        data: { 
          data: [], 
          message: 'No learning plans found. Start learning by enrolling in a course!' 
        }, 
        error: null 
      };
    }
  },

  updateTaskStatus: async (planId, taskIndex, isCompleted) => {
    try {
      const response = await axiosInstance.put(`/api/v1/plans/${planId}/tasks/${taskIndex}`, null, {
        params: { isCompleted }
      });
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error updating task status:', error);
      return { data: null, error: 'Failed to update task status. Please try again.' };
    }
  }
};