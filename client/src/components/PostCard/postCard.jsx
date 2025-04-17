import React, { useRef, useEffect } from 'react';
import CommentInput from '../CommentInput/commentInput';
import { FiThumbsUp, FiMessageSquare, FiShare, FiBookmark, FiMoreVertical } from 'react-icons/fi';
import { useStore } from '../../../store';

const PostCard = ({ id, authorName, authorRole, authorImage, content, image, likes, comments, shares, saves, hashtags }) => {
  const menuRef = useRef(null);
  
  const {
    likedPosts,
    savedPosts,
    activePostMenu,
    togglePostMenu,
    closeAllPostMenus,
    likePost,
    unlikePost,
    savePost,
    unsavePost
  } = useStore();

  const isMenuOpen = activePostMenu === id;
  const isLiked = likedPosts?.includes(id);
  const isSaved = savedPosts?.includes(id);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        closeAllPostMenus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeAllPostMenus]);

  const handleLikeToggle = () => {
    if (isLiked) {
      unlikePost(id);
    } else {
      likePost(id);
    }
  };

  const handleSaveToggle = () => {
    if (isSaved) {
      unsavePost(id);
    } else {
      savePost(id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-5 mb-5 w-full">
      {/* Post Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <img src={authorImage || "/api/placeholder/40/40"} alt="Author" className="w-10 h-10 rounded-full object-cover mr-2.5" />
          <div className="flex flex-col">
            <h4 className="m-0 text-base font-semibold">{authorName}</h4>
            <p className="m-0 text-xs text-gray-500">{authorRole}</p>
          </div>
        </div>
        <div className="relative" ref={menuRef}>
          <button 
            className="bg-transparent border-none cursor-pointer text-gray-500 p-2 rounded-full hover:bg-gray-100"
            onClick={() => togglePostMenu(id)}
          >
            <FiMoreVertical className="text-xl" />
          </button>
          
          {/* Kebab Menu Dropdown */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 py-1 border border-gray-200">
              <button 
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={handleSaveToggle}
              >
                {isSaved ? 'Unsave Post' : 'Save Post'}
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Hide Post
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Report Post
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Copy Link
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div className="mb-3">
        <p className="m-0 mb-2 text-sm sm:text-base leading-relaxed break-words">{content}</p>
        {hashtags && (
          <div className="flex flex-wrap gap-2 mt-2">
            {hashtags.map((tag, index) => (
              <span key={index} className="text-blue-500 text-sm cursor-pointer">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Post Image */}
      {image && (
        <div className="mb-3">
          <img src={image} alt="Post content" className="w-full max-h-[500px] object-contain rounded-lg" />
        </div>
      )}

      {/* Post Engagement */}
      <div className="flex flex-wrap justify-between py-2 border-t border-b border-gray-200 mb-2.5">
        <div className="flex items-center my-1">
          <button 
            className={`bg-transparent border-none cursor-pointer flex items-center p-1 mr-1 hover:bg-gray-100 rounded-full ${isLiked ? 'text-blue-500' : 'text-gray-500'}`}
            onClick={handleLikeToggle}
          >
            <FiThumbsUp className="text-lg" />
          </button>
          <span className="text-xs text-gray-500">
            {isLiked ? (likes || 0) + 1 : likes || 0} Likes
          </span>
        </div>
        <div className="flex items-center my-1">
          <button className="bg-transparent border-none cursor-pointer flex items-center p-1 mr-1 hover:bg-gray-100 rounded-full">
            <FiMessageSquare className="text-gray-500 text-lg" />
          </button>
          <span className="text-xs text-gray-500">{comments || 0} Comments</span>
        </div>
        <div className="flex items-center my-1">
          <button className="bg-transparent border-none cursor-pointer flex items-center p-1 mr-1 hover:bg-gray-100 rounded-full">
            <FiShare className="text-gray-500 text-lg" />
          </button>
          <span className="text-xs text-gray-500">{shares || 0} Share</span>
        </div>
        <div className="flex items-center my-1">
          <button 
            className={`bg-transparent border-none cursor-pointer flex items-center p-1 mr-1 hover:bg-gray-100 rounded-full ${isSaved ? 'text-blue-500' : 'text-gray-500'}`}
            onClick={handleSaveToggle}
          >
            <FiBookmark className="text-lg" />
          </button>
          <span className="text-xs text-gray-500">
            {isSaved ? (saves || 0) + 1 : saves || 0} Saved
          </span>
        </div>
      </div>

      {/* Comment Input */}
      <CommentInput postId={id} />
    </div>
  );
};

export default PostCard;