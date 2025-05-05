import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '../endpoints/posts';

/**
 * React Query key factory for posts
 */
export const postKeys = {
  all: ['posts'],
  lists: () => [...postKeys.all, 'list'],
  list: (filters) => [...postKeys.lists(), { filters }],
  details: () => [...postKeys.all, 'detail'],
  detail: (id) => [...postKeys.details(), id],
  userPosts: (userId) => [...postKeys.all, 'user', userId],
};

/**
 * Hook to fetch all posts
 */
export const useGetPosts = (options = {}) => {
  return useQuery({
    queryKey: postKeys.lists(),
    queryFn: postsApi.getAll,
    ...options,
  });
};

/**
 * Hook to fetch a post by ID
 */
export const useGetPostById = (id, options = {}) => {
  return useQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => postsApi.getById(id),
    enabled: !!id,
    ...options,
  });
};

/**
 * Hook to fetch posts by user ID
 */
export const useGetPostsByUserId = (userId, options = {}) => {
  return useQuery({
    queryKey: postKeys.userPosts(userId),
    queryFn: () => postsApi.getByUserId(userId),
    enabled: !!userId,
    ...options,
  });
};

/**
 * Hook to create a new post
 */
export const useCreatePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: postsApi.create,
    onSuccess: () => {
      // Invalidate posts lists to refresh data
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
};

/**
 * Hook to update an existing post
 */
export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: postsApi.update,
    onSuccess: (data, variables) => {
      // Invalidate specific post and lists
      queryClient.invalidateQueries({ queryKey: postKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
};

/**
 * Hook to delete a post
 */
export const useDeletePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: postsApi.remove,
    onSuccess: (_, id) => {
      // Remove post from cache and invalidate lists
      queryClient.removeQueries({ queryKey: postKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
};

/**
 * Hook to like a post
 */
export const useLikePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: postsApi.like,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: postKeys.detail(id) });
    },
  });
};

/**
 * Hook to unlike a post
 */
export const useUnlikePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: postsApi.unlike,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: postKeys.detail(id) });
    },
  });
};

/**
 * Hook to save a post
 */
export const useSavePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: postsApi.save,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: postKeys.detail(id) });
    },
  });
};

/**
 * Hook to unsave a post
 */
export const useUnsavePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: postsApi.unsave,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: postKeys.detail(id) });
    },
  });
};