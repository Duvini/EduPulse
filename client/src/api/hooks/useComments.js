import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsApi } from '../endpoints/comments';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';

/**
 * Hook to get comments for a post
 */
export const useGetComments = (postId) => {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: () => commentsApi.getComments(postId),
    enabled: !!postId
  });
};

/**
 * Hook to add a comment
 */
export const useAddComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ postId, content }) => commentsApi.addComment(postId, content),
    onSuccess: (response, variables) => {
      // Check for error flag in the response structure
      if (response?.error === true) {
        showErrorToast(response.message || 'Failed to add comment');
        return;
      }
      
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['commentCount', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      showSuccessToast('Comment added successfully');
    },
    onError: (error) => {
      showErrorToast(error.response?.data?.message || 'Failed to add comment');
    }
  });
};

/**
 * Hook to update a comment
 */
export const useUpdateComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ commentId, content }) => commentsApi.updateComment(commentId, content),
    onSuccess: (response, variables) => {
      // Check for error flag in the response structure
      if (response?.error === true) {
        showErrorToast(response.message || 'Failed to update comment');
        return;
      }
      
      if (variables.postId) {
        queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
      }
      showSuccessToast('Comment updated successfully');
    },
    onError: (error) => {
      showErrorToast(error.response?.data?.message || 'Failed to update comment');
    }
  });
};

/**
 * Hook to delete a comment
 */
export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ commentId }) => commentsApi.deleteComment(commentId),
    onSuccess: (response, variables) => {
      // Check for error flag in the response structure
      if (response?.error === true) {
        showErrorToast(response.message || 'Failed to delete comment');
        return;
      }
      
      if (variables.postId) {
        queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
        queryClient.invalidateQueries({ queryKey: ['commentCount', variables.postId] });
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      }
      showSuccessToast('Comment deleted successfully');
    },
    onError: (error) => {
      showErrorToast(error.response?.data?.message || 'Failed to delete comment');
    }
  });
};

/**
 * Hook to get comment count for a post
 */
export const useCommentCount = (postId) => {
  return useQuery({
    queryKey: ['commentCount', postId],
    queryFn: () => commentsApi.getCommentCount(postId),
    enabled: !!postId
  });
};