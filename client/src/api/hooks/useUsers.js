import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../endpoints/users';

/**
 * React Query key factory for users
 */
export const userKeys = {
  all: ['users'],
  lists: () => [...userKeys.all, 'list'],
  list: (filters) => [...userKeys.lists(), { filters }],
  details: () => [...userKeys.all, 'detail'],
  detail: (id) => [...userKeys.details(), id],
  current: () => [...userKeys.all, 'current'],
  settings: () => [...userKeys.all, 'settings'],
  search: (query) => [...userKeys.all, 'search', query],
  recommended: () => [...userKeys.all, 'recommended'],
};

/**
 * Hook to get current user
 */
export const useCurrentUser = (options = {}) => {
  return useQuery({
    queryKey: userKeys.current(),
    queryFn: usersApi.getCurrentUser,
    ...options,
  });
};

/**
 * Hook to get user by ID
 */
export const useGetUserById = (userId, options = {}) => {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => usersApi.getUserById(userId),
    enabled: !!userId,
    ...options,
  });
};

/**
 * Hook to update user profile
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: usersApi.updateProfile,
    onSuccess: (data) => {
      // Update user in cache
      queryClient.setQueryData(userKeys.current(), data.data);
      
      // Invalidate user queries to refresh data
      queryClient.invalidateQueries({ queryKey: userKeys.current() });
      
      // If we know the user ID, invalidate that specific user's detail query
      if (data.data?.id) {
        queryClient.invalidateQueries({ queryKey: userKeys.detail(data.data.id) });
      }
    },
  });
};

/**
 * Hook to search users
 */
export const useSearchUsers = (query, options = {}) => {
  return useQuery({
    queryKey: userKeys.search(query),
    queryFn: () => usersApi.searchUsers(query),
    enabled: query && query.length >= 2, // Only search when query has 2+ characters
    ...options,
  });
};

/**
 * Hook to get recommended users
 */
export const useRecommendedUsers = (options = {}) => {
  return useQuery({
    queryKey: userKeys.recommended(),
    queryFn: usersApi.getRecommendedUsers,
    ...options,
  });
};

/**
 * Hook to update user settings
 */
export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: usersApi.updateSettings,
    onSuccess: () => {
      // Invalidate settings query to refresh data
      queryClient.invalidateQueries({ queryKey: userKeys.settings() });
    },
  });
};

/**
 * Hook to get user settings
 */
export const useGetSettings = (options = {}) => {
  return useQuery({
    queryKey: userKeys.settings(),
    queryFn: usersApi.getSettings,
    ...options,
  });
};