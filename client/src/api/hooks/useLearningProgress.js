import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { learningProgressApi } from '../endpoints/learningProgress';
import { showSuccessAlert, showErrorAlert } from '../../utils/sweetAlertUtils';

/**
 * React Query key factory for learning progress
 */
export const learningProgressKeys = {
  all: ['learning-progress'],
  lists: () => [...learningProgressKeys.all, 'list'],
  list: (filters) => [...learningProgressKeys.lists(), { filters }],
  details: () => [...learningProgressKeys.all, 'detail'],
  detail: (id) => [...learningProgressKeys.details(), id],
  currentUser: () => [...learningProgressKeys.all, 'current'],
  userProgress: (userId) => [...learningProgressKeys.all, 'user', userId],
  stats: () => [...learningProgressKeys.all, 'stats'],
};

/**
 * Hook to get learning progress for current user
 */
export const useGetLearningProgress = (options = {}) => {
  return useQuery({
    queryKey: learningProgressKeys.currentUser(),
    queryFn: learningProgressApi.getProgress,
    ...options,
  });
};

/**
 * Hook to get learning progress for a specific user
 */
export const useGetUserLearningProgress = (userId, options = {}) => {
  return useQuery({
    queryKey: learningProgressKeys.userProgress(userId),
    queryFn: () => learningProgressApi.getUserProgress(userId),
    enabled: !!userId,
    ...options,
  });
};

/**
 * Hook to get learning item by ID
 */
export const useGetLearningItemById = (id, options = {}) => {
  return useQuery({
    queryKey: learningProgressKeys.detail(id),
    queryFn: () => learningProgressApi.getLearningItemById(id),
    enabled: !!id,
    ...options,
  });
};

/**
 * Hook to create new learning item
 */
export const useCreateLearningItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: learningProgressApi.createLearningItem,
    onSuccess: () => {
      showSuccessAlert('Learning item created successfully');
      queryClient.invalidateQueries({ queryKey: learningProgressKeys.currentUser() });
      queryClient.invalidateQueries({ queryKey: learningProgressKeys.stats() });
    },
    onError: (error) => {
      showErrorAlert(error.response?.data?.message || 'Failed to create learning item');
    }
  });
};

/**
 * Hook to update learning item
 */
export const useUpdateLearningItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: learningProgressApi.updateLearningItem,
    onSuccess: (_, variables) => {
      showSuccessAlert('Learning item updated successfully');
      queryClient.invalidateQueries({ queryKey: learningProgressKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: learningProgressKeys.currentUser() });
      queryClient.invalidateQueries({ queryKey: learningProgressKeys.stats() });
    },
    onError: (error) => {
      showErrorAlert(error.response?.data?.message || 'Failed to update learning item');
    }
  });
};

/**
 * Hook to delete learning item
 */
export const useDeleteLearningItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: learningProgressApi.deleteLearningItem,
    onSuccess: (_, id) => {
      showSuccessAlert('Learning item deleted successfully');
      queryClient.removeQueries({ queryKey: learningProgressKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: learningProgressKeys.currentUser() });
      queryClient.invalidateQueries({ queryKey: learningProgressKeys.stats() });
    },
    onError: (error) => {
      showErrorAlert(error.response?.data?.message || 'Failed to delete learning item');
    }
  });
};

/**
 * Hook to update learning progress status
 */
export const useUpdateProgressStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: learningProgressApi.updateProgressStatus,
    onSuccess: (_, variables) => {
      showSuccessAlert('Progress status updated successfully');
      queryClient.invalidateQueries({ queryKey: learningProgressKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: learningProgressKeys.currentUser() });
      queryClient.invalidateQueries({ queryKey: learningProgressKeys.stats() });
    },
    onError: (error) => {
      showErrorAlert(error.response?.data?.message || 'Failed to update progress status');
    }
  });
};

/**
 * Hook to get learning progress statistics
 */
export const useGetLearningProgressStats = (options = {}) => {
  return useQuery({
    queryKey: learningProgressKeys.stats(),
    queryFn: learningProgressApi.getProgressStats,
    ...options,
  });
};