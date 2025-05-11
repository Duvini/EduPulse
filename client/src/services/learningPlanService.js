import axiosInstance from './axiosConfig';

export const learningPlanService = {
  getAllPlans: async () => {
    try {
      const response = await axiosInstance.get('/api/v1/plans');
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error fetching learning plans:', error);
      return { data: null, error: 'Failed to fetch learning plans' };
    }
  },

  getUserPlans: async (userId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/plans/user/${userId}`);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error fetching user plans:', error);
      return { data: null, error: 'Failed to fetch your learning plans' };
    }
  },

  getPlanById: async (planId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/plans/${planId}`);
      return { data: response.data.data, error: null };
    } catch (error) {
      console.error('Error fetching learning plan:', error);
      return { data: null, error: 'Failed to fetch learning plan details' };
    }
  },

  createPlan: async (planData) => {
    try {
      const response = await axiosInstance.post('/api/v1/plans/create', planData);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error creating learning plan:', error);
      return { data: null, error: 'Failed to create learning plan' };
    }
  },

  updatePlan: async (planId, planData) => {
    try {
      const response = await axiosInstance.patch(`/api/v1/plans/update/${planId}`, planData);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error updating learning plan:', error);
      return { data: null, error: 'Failed to update learning plan' };
    }
  },

  deletePlan: async (planId) => {
    try {
      const response = await axiosInstance.delete(`/api/v1/plans/delete/${planId}`);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error deleting learning plan:', error);
      return { data: null, error: 'Failed to delete learning plan' };
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
      return { data: null, error: 'Failed to update task status' };
    }
  }
};

// Add default export
export default learningPlanService;