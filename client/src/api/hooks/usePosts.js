import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '../endpoints/posts';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';

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
    onSuccess: (response) => {
      // Check if the response indicates an error with exact error flag matching
      if (response?.error === true) {
        showErrorToast(response.message || 'Failed to create post');
        return;
      }
      
      // Add the new post to the posts cache
      const newPost = response.data;
      if (newPost) {
        // Update the posts list in the cache by prepending the new post
        queryClient.setQueryData(postKeys.lists(), (oldData) => {
          // If there's no previous data, create a new array
          if (!oldData) return [newPost];
          
          // Otherwise, add the new post to the beginning of the list
          return [newPost, ...oldData];
        });
      }
      
      // Still invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      showSuccessToast('Post created successfully');
    },
    onError: (error) => {
      showErrorToast(error.response?.data?.message || 'Failed to create post');
    }
  });
};

/**
 * Hook to update an existing post
 */
export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: postsApi.update,
    onSuccess: (response, variables) => {
      // Check if the response indicates an error with exact error flag matching
      if (response?.error === true) {
        showErrorToast(response.message || 'Failed to update post');
        return;
      }
      
      queryClient.invalidateQueries({ queryKey: postKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      showSuccessToast('Post updated successfully');
    },
    onError: (error) => {
      showErrorToast(error.response?.data?.message || 'Failed to update post');
    }
  });
};

/**
 * Hook to delete a post
 */
export const useDeletePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: postsApi.remove,
    onSuccess: (response, id) => {
      // Check if the response indicates an error with exact error flag matching
      if (response?.error === true) {
        showErrorToast(response.message || 'Failed to delete post');
        return;
      }
      
      queryClient.removeQueries({ queryKey: postKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      showSuccessToast('Post deleted successfully');
    },
    onError: (error) => {
      showErrorToast(error.response?.data?.message || 'Failed to delete post');
    }
  });
};

/**
 * Hook to like a post
 */
export const useLikePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: postsApi.like,
    onSuccess: (response, id) => {
      // Check if the response indicates an error with exact error flag matching
      if (response?.error === true) {
        showErrorToast(response.message || 'Failed to like post');
        return;
      }
      
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
    onSuccess: (response, id) => {
      // Check if the response indicates an error with exact error flag matching
      if (response?.error === true) {
        showErrorToast(response.message || 'Failed to unlike post');
        return;
      }
      
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
    onSuccess: (response, id) => {
      // Check if the response indicates an error with exact error flag matching
      if (response?.error === true) {
        showErrorToast(response.message || 'Failed to save post');
        return;
      }
      
      queryClient.invalidateQueries({ queryKey: postKeys.detail(id) });
      showSuccessToast('Post saved successfully');
    },
    onError: (error) => {
      showErrorToast(error.response?.data?.message || 'Failed to save post');
    }
  });
};

/**
 * Hook to unsave a post
 */
export const useUnsavePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: postsApi.unsave,
    onSuccess: (response, id) => {
      // Check if the response indicates an error with exact error flag matching
      if (response?.error === true) {
        showErrorToast(response.message || 'Failed to unsave post');
        return;
      }
      
      queryClient.invalidateQueries({ queryKey: postKeys.detail(id) });
      showSuccessToast('Post unsaved successfully');
    },
    onError: (error) => {
      showErrorToast(error.response?.data?.message || 'Failed to unsave post');
    }
  });
};