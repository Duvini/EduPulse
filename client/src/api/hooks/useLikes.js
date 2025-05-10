import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { likesApi } from '../endpoints/likes';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';

/**
 * Hook to get likes for a post
 */
export const useGetLikes = (postId) => {
  return useQuery({
    queryKey: ['likes', postId],
    queryFn: () => likesApi.getLikes(postId),
    enabled: !!postId
  });
};

/**
 * Hook to like a post
 */
export const useLikePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (postId) => likesApi.likePost(postId),
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ['likes', postId] });
      queryClient.invalidateQueries({ queryKey: ['likeCount', postId] });
      queryClient.invalidateQueries({ queryKey: ['checkLiked', postId] });
      showSuccessToast('Post liked');
    },
    onError: (error) => {
      showErrorToast(error.response?.data?.message || 'Failed to like post');
    }
  });
};

/**
 * Hook to unlike a post
 */
export const useUnlikePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (postId) => likesApi.unlikePost(postId),
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ['likes', postId] });
      queryClient.invalidateQueries({ queryKey: ['likeCount', postId] });
      queryClient.invalidateQueries({ queryKey: ['checkLiked', postId] });
      showSuccessToast('Post unliked');
    },
    onError: (error) => {
      showErrorToast(error.response?.data?.message || 'Failed to unlike post');
    }
  });
};

/**
 * Hook to check if user has liked a post
 */
export const useCheckLiked = (postId) => {
  return useQuery({
    queryKey: ['checkLiked', postId],
    queryFn: () => likesApi.checkLiked(postId),
    enabled: !!postId
  });
};

/**
 * Hook to get like count for a post
 */
export const useLikeCount = (postId) => {
  return useQuery({
    queryKey: ['likeCount', postId],
    queryFn: () => likesApi.getLikeCount(postId),
    enabled: !!postId
  });
};