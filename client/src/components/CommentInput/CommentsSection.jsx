import React, { useState, useEffect } from 'react';
import { useGetComments } from '../../api/hooks/useComments';
import Comment from './Comment';
import { showErrorToast } from '../../utils/toastUtils';

const CommentsSection = ({ postId, currentUserId }) => {
  const [showAllComments, setShowAllComments] = useState(false);
  const { data: commentsResponse, isLoading, isError, error } = useGetComments(postId);
  
  // Handle errors - both from API error responses and request failures
  useEffect(() => {
    // Handle request error through isError flag
    if (isError) {
      showErrorToast(error?.response?.data?.message || 'Failed to load comments');
    }
    
    // Handle API response with error: true
    if (commentsResponse && commentsResponse.error === true) {
      showErrorToast(commentsResponse.message || 'An unexpected error occurred');
    }
  }, [isError, error, commentsResponse]);
  
  if (isLoading) {
    return (
      <div className="p-3 text-center text-sm text-gray-500">
        Loading comments...
      </div>
    );
  }
  
  // More robust data handling
  let comments = [];
  
  if (commentsResponse) {
    if (Array.isArray(commentsResponse)) {
      comments = commentsResponse;
    } else if (commentsResponse.data && Array.isArray(commentsResponse.data)) {
      comments = commentsResponse.data;
    }
  }
  
  if (comments.length === 0) {
    return (
      <div className="p-3 text-center text-sm text-gray-500">
        {isError ? 'Unable to load comments' : 'No comments yet. Be the first to comment!'}
      </div>
    );
  }
  
  const commentsToShow = showAllComments ? comments : comments.slice(0, 3);
  
  return (
    <div className="border-t border-gray-100 px-3 py-2">
      {commentsToShow.map((comment) => (
        <Comment
          key={comment.id}
          id={comment.id}
          content={comment.content}
          authorId={comment.userId}
          authorName={comment.userName}
          authorImage={comment.userImage}
          createdAt={comment.createdAt}
          updatedAt={comment.updatedAt}
          currentUserId={currentUserId}
          postId={postId}
        />
      ))}
      
      {comments.length > 3 && (
        <button
          className="mt-1 text-sm text-blue-500 hover:text-blue-700 cursor-pointer"
          onClick={() => setShowAllComments(!showAllComments)}
        >
          {showAllComments ? 'Show less' : `Show all ${comments.length} comments`}
        </button>
      )}
    </div>
  );
};

export default CommentsSection;