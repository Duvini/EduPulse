import React, { useState, useEffect } from 'react';
import { FiTrash2, FiEdit2 } from 'react-icons/fi';
import { getMediaUrl } from '../../services/apiClient';
import { useDeleteComment, useUpdateComment } from '../../api/hooks/useComments';

const Comment = ({ 
  id, 
  content, 
  authorId, 
  authorName, 
  authorImage, 
  createdAt, 
  updatedAt,
  currentUserId,
  postId 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [showIcons, setShowIcons] = useState(false);

  const deleteCommentMutation = useDeleteComment();
  const updateCommentMutation = useUpdateComment();
  const isAuthor = currentUserId === authorId;

  // Handle right-click to show icons
  const handleRightClick = (e) => {
    e.preventDefault();
    if (isAuthor) setShowIcons(true);
  };

  const handleClickOutside = () => setShowIcons(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowIcons(false);
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Date formatting logic
  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Just now';
      const now = new Date();
      const diffSec = Math.floor((now - date) / 1000);

      if (diffSec < 0) return 'Just now';
      if (diffSec < 60) return 'Just now';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)} minute(s) ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hour(s) ago`;
      if (diffSec < 604800) return `${Math.floor(diffSec / 86400)} day(s) ago`;

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return 'Unknown time';
    }
  };

  const formattedDate = formatDate(createdAt);
  const wasEdited = updatedAt && createdAt && 
    new Date(updatedAt).getTime() > (new Date(createdAt).getTime() + 2000);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      deleteCommentMutation.mutate({ commentId: id, postId });
    }
  };

  const handleEdit = () => setIsEditing(true);
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(content);
  };

  const handleSaveEdit = () => {
    if (editedContent.trim() === '') return;
    updateCommentMutation.mutate(
      { commentId: id, content: editedContent.trim(), postId },
      {
        onSuccess: () => setIsEditing(false),
        onError: (error) => console.error("Failed to update comment:", error)
      }
    );
  };

  return (
    <div 
      className="py-2 border-b border-gray-100 last:border-0"
      onContextMenu={handleRightClick}
    >
      <div className="flex gap-2">
      <img 
          src={authorImage ? getMediaUrl(authorImage) : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23CBD5E1"%3E%3Cpath d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z"%3E%3C/path%3E%3C/svg%3E'} 
          alt={authorName} 
          className="w-8 h-8 rounded-full object-cover"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23CBD5E1"%3E%3Cpath d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z"%3E%3C/path%3E%3C/svg%3E';
          }}
        />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-semibold text-sm">{authorName}</span>
              <span className="text-xs text-gray-500 ml-2">
                {formattedDate}
                {wasEdited && <span className="ml-1 text-xs text-gray-400">(Edited)</span>}
              </span>
            </div>
            {isAuthor && showIcons && (
              <div className="flex space-x-1">
                <button 
                  className="p-1 text-gray-500 hover:text-blue-600 rounded"
                  onClick={handleEdit}
                  disabled={isEditing}
                >
                  <FiEdit2 size={14} />
                </button>
                <button 
                  className="p-1 text-gray-500 hover:text-red-600 rounded"
                  onClick={handleDelete}
                  disabled={deleteCommentMutation.isPending}
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="mt-1">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 rounded resize-none focus:outline-none focus:border-blue-500"
                rows={2}
              />
              <div className="flex justify-end mt-1 gap-2">
                <button 
                  className="px-3 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
                <button 
                  className="px-3 py-1 text-xs text-white bg-blue-500 rounded hover:bg-blue-600"
                  onClick={handleSaveEdit}
                  disabled={updateCommentMutation.isPending}
                >
                  {updateCommentMutation.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-800 break-words">{content}</p>
          )}

          {(deleteCommentMutation.isError || updateCommentMutation.isError) && (
            <div className="mt-1 text-xs text-red-500">
              An error occurred. Please try again.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Comment;
