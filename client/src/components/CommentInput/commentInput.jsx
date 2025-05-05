import React, { useState } from 'react';
import { FiPaperclip, FiSmile, FiSend } from 'react-icons/fi';
import { useStore } from '../../../store';
import { authService } from '../../services/authService';

// Default user avatar as SVG data URL
const defaultUserAvatar = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23CBD5E1"%3E%3Cpath d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z"%3E%3C/path%3E%3C/svg%3E';

const CommentInput = ({ postId }) => {
  const [comment, setComment] = useState('');
  const [avatarError, setAvatarError] = useState(false);
  const addComment = useStore();
  const currentUser = authService.getCurrentUser();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (comment.trim()) {
      addComment(postId, comment);
      setComment('');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex items-center py-2 w-full">
      <img 
        src={avatarError ? defaultUserAvatar : (currentUser?.profileImage || defaultUserAvatar)} 
        alt="User avatar" 
        className="w-8 h-8 rounded-full mr-2 object-cover bg-gray-100"
        onError={() => setAvatarError(true)}
      />
      <div className="flex-1 relative">
        <input 
          type="text" 
          className="w-full py-2 px-3 border border-gray-200 rounded-full bg-gray-100 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
          placeholder="Write your comment..." 
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>
      <div className="flex items-center ml-2">
        <button 
          type="button" 
          className="bg-transparent border-none cursor-pointer p-1.5 text-gray-500 hover:bg-gray-100 rounded-full transition-colors duration-200"
          title="Attach file"
        >
          <FiPaperclip className="text-lg" />
        </button>
        <button 
          type="button" 
          className="bg-transparent border-none cursor-pointer p-1.5 text-gray-500 hover:bg-gray-100 rounded-full transition-colors duration-200"
          title="Add emoji"
        >
          <FiSmile className="text-lg" />
        </button>
        <button 
          type="submit" 
          className="bg-transparent border-none cursor-pointer p-1.5 text-gray-500 hover:bg-gray-100 rounded-full transition-colors duration-200"
          disabled={!comment.trim()}
          title="Send comment"
        >
          <FiSend className={`text-lg ${comment.trim() ? 'text-blue-500' : ''}`} />
        </button>
      </div>
    </form>
  );
};

export default CommentInput;