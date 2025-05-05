import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { learningProgressApi } from '../endpoints/learningProgress';

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
      // Invalidate learning progress lists to refresh data
      queryClient.invalidateQueries({ queryKey: learningProgressKeys.currentUser() });
      queryClient.invalidateQueries({ queryKey: learningProgressKeys.stats() });
    },
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
      // Invalidate specific learning item and lists
      queryClient.invalidateQueries({ queryKey: learningProgressKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: learningProgressKeys.currentUser() });
      queryClient.invalidateQueries({ queryKey: learningProgressKeys.stats() });
    },
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
      // Remove item from cache and invalidate lists
      queryClient.removeQueries({ queryKey: learningProgressKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: learningProgressKeys.currentUser() });
      queryClient.invalidateQueries({ queryKey: learningProgressKeys.stats() });
    },
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
      // Invalidate specific learning item and lists
      queryClient.invalidateQueries({ queryKey: learningProgressKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: learningProgressKeys.currentUser() });
      queryClient.invalidateQueries({ queryKey: learningProgressKeys.stats() });
    },
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