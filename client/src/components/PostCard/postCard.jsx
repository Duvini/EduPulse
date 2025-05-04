import React, { useRef, useEffect, useState } from 'react';
import CommentInput from '../CommentInput/commentInput';
import { FiThumbsUp, FiMessageSquare, FiShare, FiBookmark, FiMoreVertical } from 'react-icons/fi';
import { useStore } from '../../../store';
import { skillPostService } from '../../services/skillPostService';
import SkillPostEditForm from '../CommentInput/SkillPostEditForm';
import DeleteConfirmationModal from '../Modal/DeleteConfirmationModal';
import Modal from '../Modal/Modal';

const BASE_URL = 'http://localhost:8080';

const PostCard = ({
  id,
  authorName,
  authorRole,
  authorImage,
  content,
  image,
  mediaUrls, // Add mediaUrls prop
  likes,
  comments,
  shares,
  saves,
  hashtags,
  userId,
  currentUserId,
  onPostUpdated
}) => {
  const menuRef = useRef(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await skillPostService.deletePost(id);
      setIsDeleteModalOpen(false);
      if (onPostUpdated) {
        onPostUpdated();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleUpdateSuccess = () => {
    setIsEditModalOpen(false);
    if (onPostUpdated) {
      onPostUpdated();
    }
  };

  // Helper function to construct full URL for media
  const getMediaUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${BASE_URL}${url}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-5 mb-5 w-full">
      {/* Post Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <img 
            src={getMediaUrl(authorImage) || "/api/placeholder/40/40"} 
            alt="Author" 
            className="w-10 h-10 rounded-full object-cover mr-2.5"
          />
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

      {/* Post Media */}
      {(mediaUrls?.length > 0 || image) && (
        <div className="mb-3 grid grid-cols-1 gap-2">
          {/* Support both old 'image' prop and new 'mediaUrls' array */}
          {(mediaUrls || [image]).filter(Boolean).map((mediaUrl, index) => {
            const fullUrl = getMediaUrl(mediaUrl);
            const isVideo = mediaUrl?.toLowerCase().endsWith('.mp4');

            return isVideo ? (
              <video 
                key={index}
                controls
                className="w-full max-h-[500px] object-contain rounded-lg"
                onError={(e) => {
                  console.error('Video failed to load:', mediaUrl);
                  e.target.style.display = 'none';
                }}
              >
                <source src={fullUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img 
                key={index}
                src={fullUrl} 
                alt={`Post content ${index + 1}`}
                className="w-full max-h-[500px] object-contain rounded-lg"
                onError={(e) => {
                  console.error('Image failed to load:', mediaUrl);
                  e.target.style.display = 'none';
                }}
              />
            );
          })}
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

      {/* Edit/Delete Buttons */}
      {currentUserId === userId && (
        <div className="flex space-x-2 mt-3">
          <button
            onClick={handleEdit}
            className="text-gray-500 hover:text-blue-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="text-gray-500 hover:text-red-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <Modal onClose={() => setIsEditModalOpen(false)}>
          <SkillPostEditForm
            postId={id}
            initialData={{
              description: content,
              tags: hashtags,
            }}
            onSubmitSuccess={handleUpdateSuccess}
          />
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default PostCard;