import React, { useState, useEffect } from 'react';
import { FiSend } from 'react-icons/fi';
import { useAddComment } from '../../api/hooks/useComments';

const CommentInput = ({ postId }) => {
  const [comment, setComment] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const addCommentMutation = useAddComment();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!comment.trim()) return;

    addCommentMutation.mutate(
      {
        postId,
        content: comment.trim(),
      },
      {
        onSuccess: () => {
          setComment('');
        },
        onError: (error) => {
          console.error('Error adding comment:', error);
        },
      }
    );
  };

  return (
    <div>
      {/* Display Current Date and Time */}
      {/* <div className="text-sm text-gray-500 mb-2">
        {currentDateTime.toLocaleString()}
      </div> */}

      <form onSubmit={handleSubmit} className="flex items-center">
        <input
          type="text"
          placeholder="Add a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="flex-1 py-1.5 px-2 border border-gray-200 rounded-l-md focus:outline-none focus:border-blue-300 text-sm"
          disabled={addCommentMutation.isPending}
        />

        <button
          type="submit"
          className={`${
            comment.trim() ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-300 cursor-not-allowed'
          } text-white py-1.5 px-3 rounded-r-md transition-colors duration-200 flex items-center justify-center min-h-[34px]`}
          disabled={addCommentMutation.isPending || !comment.trim()}
        >
          {addCommentMutation.isPending ? (
            <span className="inline-block animate-spin">⏳</span>
          ) : (
            <FiSend size={16} />
          )}
        </button>

        {addCommentMutation.isError && (
          <div className="mt-1 text-xs text-red-500 w-full">
            Failed to add comment. Please try again.
          </div>
        )}
      </form>
    </div>
  );
};

export default CommentInput;