import React, { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import CommentInput from '../CommentInput/commentInput';
import { FiThumbsUp, FiMessageSquare, FiShare, FiBookmark, FiMoreVertical, FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { skillPostService } from '../../services/skillPostService';
import { getMediaUrl } from '../../services/axiosConfig';
import SkillPostEditForm from '../CommentInput/SkillPostEditForm';
import DeleteConfirmationModal from '../Modal/DeleteConfirmationModal';
import Modal from '../Modal/Modal';

// Default user avatar as SVG data URL
const defaultUserAvatar = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23CBD5E1"%3E%3Cpath d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z"%3E%3C/path%3E%3C/svg%3E';

const PostCard = ({
  id,
  authorName,
  authorRole,
  authorImage,
  content,
  image,
  mediaUrls,
  likes,
  comments,
  shares,
  saves,
  hashtags,
  userId,
  currentUserId,
  onPostUpdated,
  isLiked: initialIsLiked = false,
  isSaved: initialIsSaved = false,
}) => {
  const menuRef = useRef(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [error, setError] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [likesCount, setLikesCount] = useState(likes || 0);
  const [savesCount, setSavesCount] = useState(saves || 0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLikeToggle = () => {
    setIsLiked(!isLiked);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const handleSaveToggle = () => {
    setIsSaved(!isSaved);
    setSavesCount((prev) => (isSaved ? prev - 1 : prev + 1));
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditModalOpen(true);
    setIsMenuOpen(false);
  };

  const handleDelete = async () => {
    try {
      const response = await skillPostService.deletePost(id);
      if (response.error) {
        setError(response.message || 'Failed to delete post');
        return;
      }
      setIsDeleteModalOpen(false);
      if (onPostUpdated) {
        onPostUpdated();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('Failed to delete post. Please try again.');
    }
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleteModalOpen(true);
    setIsMenuOpen(false);
  };

  const handleUpdateSuccess = (response) => {
    if (response.cancelled) {
      setIsEditModalOpen(false);
      setError(null);
      return;
    }
    
    if (response.error) {
      setError(response.message || 'Failed to update post');
      return;
    }
    setIsEditModalOpen(false);
    setError(null);
    if (onPostUpdated) {
      onPostUpdated();
    }
  };

  const handlePreviousImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    const maxIndex = (mediaUrls || [image]).filter(Boolean).length - 1;
    setCurrentImageIndex((prev) => (prev < maxIndex ? prev + 1 : maxIndex));
  };

  // Create portal container for modals
  useEffect(() => {
    const portalContainer = document.createElement('div');
    portalContainer.id = `modal-root-${id}`;
    document.body.appendChild(portalContainer);

    return () => {
      document.body.removeChild(portalContainer);
    };
  }, [id]);

  return (
    <>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-4 sm:p-5 mb-5 w-full">
        {/* Post Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center group">
            <div className="relative">
              <img
                src={avatarError ? defaultUserAvatar : (authorImage ? getMediaUrl(authorImage) : defaultUserAvatar)}
                alt="Author"
                className="w-10 h-10 rounded-full object-cover mr-2.5 bg-gray-100 ring-2 ring-transparent group-hover:ring-blue-200 transition-all duration-200"
                onError={() => setAvatarError(true)}
              />
              {currentUserId === userId && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            <div className="flex flex-col">
              <h4 className="m-0 text-base font-semibold group-hover:text-blue-600 transition-colors duration-200">{authorName}</h4>
              <p className="m-0 text-xs text-gray-500">{authorRole}</p>
            </div>
          </div>
          <div className="relative" ref={menuRef}>
            <button
              className="bg-transparent border-none cursor-pointer text-gray-500 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <FiMoreVertical className="text-xl" />
            </button>

            {/* Kebab Menu Dropdown */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 py-1 border border-gray-200 transform transition-all duration-200">
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 flex items-center"
                  onClick={handleSaveToggle}
                >
                  <FiBookmark className="mr-2" />
                  {isSaved ? 'Unsave Post' : 'Save Post'}
                </button>
                {currentUserId === userId && (
                  <>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 flex items-center"
                      onClick={handleEdit}
                    >
                      <FiEdit2 className="mr-2" />
                      Edit Post
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center"
                      onClick={handleDeleteClick}
                    >
                      <FiTrash2 className="mr-2" />
                      Delete Post
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Post Content */}
        <div className="mb-4">
          <p className="m-0 mb-2 text-sm sm:text-base leading-relaxed break-words text-gray-800">{content}</p>
          {hashtags && hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {hashtags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors duration-200 cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Post Media */}
        {(mediaUrls?.length > 0 || image) && (
          <div className="mb-4 relative">
            <div className="grid grid-cols-1">
              {(() => {
                const allMedia = (mediaUrls || [image]).filter(Boolean);
                const currentMedia = allMedia[currentImageIndex];
                const fullUrl = getMediaUrl(currentMedia);
                if (!fullUrl) return null;

                const isVideo = currentMedia?.toLowerCase().endsWith('.mp4');

                return isVideo ? (
                  <div className="relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200">
                    <video
                      controls
                      className="w-full max-h-[500px] object-contain bg-black"
                      onError={(e) => {
                        console.error('Video failed to load:', currentMedia);
                        e.target.style.display = 'none';
                      }}
                    >
                      <source src={fullUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ) : (
                  <div className="relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200">
                    <img
                      src={fullUrl}
                      alt={`Post content ${currentImageIndex + 1}`}
                      className="w-full max-h-[500px] object-contain"
                      onError={(e) => {
                        console.error('Image failed to load:', currentMedia);
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                );
              })()}
            </div>
            
            {/* Navigation Buttons */}
            {(mediaUrls?.length > 1 || (mediaUrls?.length + (image ? 1 : 0)) > 1) && (
              <>
                <button
                  onClick={handlePreviousImage}
                  className={`absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 text-gray-800 hover:bg-white hover:text-blue-600 shadow-md transition-all duration-200 ${
                    currentImageIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
                  }`}
                  disabled={currentImageIndex === 0}
                >
                  <FiChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNextImage}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 text-gray-800 hover:bg-white hover:text-blue-600 shadow-md transition-all duration-200 ${
                    currentImageIndex === (mediaUrls || [image]).filter(Boolean).length - 1 ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
                  }`}
                  disabled={currentImageIndex === (mediaUrls || [image]).filter(Boolean).length - 1}
                >
                  <FiChevronRight className="w-6 h-6" />
                </button>
                
                {/* Image Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 text-white text-sm">
                  {currentImageIndex + 1} / {(mediaUrls || [image]).filter(Boolean).length}
                </div>
              </>
            )}
          </div>
        )}

        {/* Post Engagement */}
        <div className="flex flex-wrap justify-between py-3 border-t border-b border-gray-200 mb-4">
          <div className="flex items-center space-x-6">
            <button className="flex items-center space-x-2 group" onClick={handleLikeToggle}>
              <div
                className={`p-2 rounded-full transition-colors duration-200 group-hover:bg-blue-50 ${
                  isLiked ? 'text-blue-500' : 'text-gray-500 group-hover:text-blue-500'
                }`}
              >
                <FiThumbsUp className="text-lg" />
              </div>
              <span
                className={`text-sm ${
                  isLiked ? 'text-blue-500' : 'text-gray-500 group-hover:text-blue-500'
                } transition-colors duration-200`}
              >
                {likesCount}
              </span>
            </button>

            <button className="flex items-center space-x-2 group">
              <div className="p-2 rounded-full text-gray-500 group-hover:text-blue-500 group-hover:bg-blue-50 transition-colors duration-200">
                <FiMessageSquare className="text-lg" />
              </div>
              <span className="text-sm text-gray-500 group-hover:text-blue-500 transition-colors duration-200">
                {comments || 0}
              </span>
            </button>

            <button className="flex items-center space-x-2 group">
              <div className="p-2 rounded-full text-gray-500 group-hover:text-blue-500 group-hover:bg-blue-50 transition-colors duration-200">
                <FiShare className="text-lg" />
              </div>
              <span className="text-sm text-gray-500 group-hover:text-blue-500 transition-colors duration-200">
                {shares || 0}
              </span>
            </button>
          </div>

          <button className="flex items-center space-x-2 group" onClick={handleSaveToggle}>
            <div
              className={`p-2 rounded-full transition-colors duration-200 group-hover:bg-blue-50 ${
                isSaved ? 'text-blue-500' : 'text-gray-500 group-hover:text-blue-500'
              }`}
            >
              <FiBookmark className="text-lg" />
            </div>
            <span
              className={`text-sm ${
                isSaved ? 'text-blue-500' : 'text-gray-500 group-hover:text-blue-500'
              } transition-colors duration-200`}
            >
              {savesCount}
            </span>
          </button>
        </div>

        {/* Comment Input */}
        <CommentInput postId={id} />
      </div>

      {/* Portals for Modals */}
      {isEditModalOpen &&
        document.getElementById(`modal-root-${id}`) &&
        ReactDOM.createPortal(
          <Modal
            onClose={() => {
              setIsEditModalOpen(false);
              setError(null);
            }}
          >
            <SkillPostEditForm
              postId={id}
              initialData={{
                description: content,
                tags: hashtags,
                mediaUrls: mediaUrls
              }}
              onSubmitSuccess={handleUpdateSuccess}
            />
          </Modal>,
          document.getElementById(`modal-root-${id}`)
        )}

      {isDeleteModalOpen &&
        document.getElementById(`modal-root-${id}`) &&
        ReactDOM.createPortal(
          <DeleteConfirmationModal
            isOpen={true}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setError(null);
            }}
            onConfirm={handleDelete}
            title="Delete Post"
            message="Are you sure you want to delete this post? This action cannot be undone."
          />,
          document.getElementById(`modal-root-${id}`)
        )}
    </>
  );
};

export default PostCard;