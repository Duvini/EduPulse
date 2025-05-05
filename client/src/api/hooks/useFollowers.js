import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { followersApi } from '../endpoints/followers';

/**
 * React Query key factory for followers
 */
export const followerKeys = {
  all: ['followers'],
  lists: () => [...followerKeys.all, 'list'],
  list: (filters) => [...followerKeys.lists(), { filters }],
  details: () => [...followerKeys.all, 'detail'],
  detail: (id) => [...followerKeys.details(), id],
  userFollowers: (userId) => [...followerKeys.all, 'user', userId, 'followers'],
  userFollowing: (userId) => [...followerKeys.all, 'user', userId, 'following'],
  stats: (userId) => [...followerKeys.all, 'user', userId, 'stats'],
  checkFollowing: (userId) => [...followerKeys.all, 'check', userId],
};

/**
 * Hook to get followers of a user
 */
export const useGetFollowers = (userId, options = {}) => {
  return useQuery({
    queryKey: followerKeys.userFollowers(userId),
    queryFn: () => followersApi.getFollowers(userId),
    enabled: !!userId,
    ...options,
  });
};

/**
 * Hook to get users that a user is following
 */
export const useGetFollowing = (userId, options = {}) => {
  return useQuery({
    queryKey: followerKeys.userFollowing(userId),
    queryFn: () => followersApi.getFollowing(userId),
    enabled: !!userId,
    ...options,
  });
};

/**
 * Hook to follow a user
 */
export const useFollowUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: followersApi.followUser,
    onSuccess: (_, userId) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: followerKeys.userFollowers(userId) });
      queryClient.invalidateQueries({ queryKey: followerKeys.stats(userId) });
      queryClient.invalidateQueries({ queryKey: followerKeys.checkFollowing(userId) });
    },
  });
};

/**
 * Hook to unfollow a user
 */
export const useUnfollowUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: followersApi.unfollowUser,
    onSuccess: (_, userId) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: followerKeys.userFollowers(userId) });
      queryClient.invalidateQueries({ queryKey: followerKeys.stats(userId) });
      queryClient.invalidateQueries({ queryKey: followerKeys.checkFollowing(userId) });
    },
  });
};

/**
 * Hook to check if current user is following another user
 */
export const useCheckFollowing = (userId, options = {}) => {
  return useQuery({
    queryKey: followerKeys.checkFollowing(userId),
    queryFn: () => followersApi.checkFollowing(userId),
    enabled: !!userId,
    ...options,
  });
};

/**
 * Hook to get follower statistics
 */
export const useGetFollowerStats = (userId, options = {}) => {
  return useQuery({
    queryKey: followerKeys.stats(userId),
    queryFn: () => followersApi.getStats(userId),
    enabled: !!userId,
    ...options,
  });
};