import axiosInstance from './axiosConfig';

export const learningProgressService = {
  getUserProgress: async () => {
    try {
      const response = await axiosInstance.get('/api/v1/plans');
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error fetching learning progress:', error);
      return { data: null, error: error.message };
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
      return { data: null, error: error.message };
    }
  }
};