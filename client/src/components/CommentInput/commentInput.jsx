import React, { useState } from 'react';
import { FiPaperclip, FiSmile, FiSend } from 'react-icons/fi';
import { useStore } from '../../../store';

const CommentInput = ({ postId }) => {
  const [comment, setComment] = useState('');
  const addComment = useStore();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (comment.trim()) {
      addComment(postId, comment);
      setComment('');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex items-center py-2 w-full">
      <img src="/api/placeholder/36/36" alt="User" className="w-8 h-8 rounded-full mr-2 object-cover" />
      <div className="flex-1 relative">
        <input 
          type="text" 
          className="w-full py-2 px-3 border border-gray-200 rounded-full bg-gray-100 text-sm outline-none" 
          placeholder="Write your comment..." 
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>
      <div className="flex items-center ml-2">
        <button type="button" className="bg-transparent border-none cursor-pointer p-1.5 text-gray-500 hover:bg-gray-100 rounded-full">
          <FiPaperclip className="text-lg" />
        </button>
        <button type="button" className="bg-transparent border-none cursor-pointer p-1.5 text-gray-500 hover:bg-gray-100 rounded-full">
          <FiSmile className="text-lg" />
        </button>
        <button 
          type="submit" 
          className="bg-transparent border-none cursor-pointer p-1.5 text-gray-500 hover:bg-gray-100 rounded-full"
          disabled={!comment.trim()}
        >
          <FiSend className={`text-lg ${comment.trim() ? 'text-blue-500' : ''}`} />
        </button>
      </div>
    </form>
  );
};

export default CommentInput;