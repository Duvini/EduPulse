import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsApi } from '../endpoints/comments';

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
    onSuccess: (_, variables) => {
      // Invalidate both comments list and count queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['commentCount', variables.postId] });
      
      // Update posts query data to refresh UI elements
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  });
};

/**
 * Hook to update a comment
 */
export const useUpdateComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ commentId, content, postId }) => commentsApi.updateComment(commentId, content),
    onSuccess: (_, variables) => {
      if (variables.postId) {
        queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
      }
    }
  });
};

/**
 * Hook to delete a comment
 */
export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ commentId, postId }) => commentsApi.deleteComment(commentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['commentCount', variables.postId] });
      
      // Update posts query data to refresh UI elements
      queryClient.invalidateQueries({ queryKey: ['posts'] });
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