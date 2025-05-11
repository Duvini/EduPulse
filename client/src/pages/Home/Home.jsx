import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PostCard from '../../components/PostCard/postCard';
import ProfileCard from '../../components/ProfileCard/ProfileCard';
import LearningProgress from '../../components/LearningProgress/LearningProgress';
import PostForm from '../../components/CommentInput/PostForm';
import Modal from '../../components/Modal/Modal';
import { getMediaUrl } from '../../services/axiosConfig';
import { useStore } from '../../../store';
import { FiPlus, FiImage, FiVideo, FiFileText } from 'react-icons/fi';
import { useGetPosts } from '../../api/hooks/usePosts';

// Default user avatar as SVG data URL
const defaultUserAvatar = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23CBD5E1"%3E%3Cpath d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z"%3E%3C/path%3E%3C/svg%3E';

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useStore();
  const navigate = useNavigate();

  // Use React Query hook to fetch and manage posts
  const { 
    data: posts = [], 
    isLoading: loading, 
    isError, 
    error: queryError,
    refetch: refetchPosts
  } = useGetPosts({
    onError: (err) => {
      console.error('Error fetching posts:', err);
      if (err.response?.status === 401) {
        navigate('/signin');
      }
      setError('Failed to fetch posts. Please try again.');
    }
  });

  // Set error message from query if needed
  useEffect(() => {
    if (isError && queryError) {
      setError(queryError.message || 'Failed to fetch posts');
      if (queryError.response?.status === 401) {
        navigate('/signin');
      }
    } else {
      setError(null);
    }
  }, [isError, queryError, navigate]);

  const handleAddPostClick = () => {
    if (!user) {
      navigate('/signin');
      return;
    }
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  // This function is called after a successful post submission
  // The post is already added to the React Query cache by the mutation
  const handlePostSubmitSuccess = () => {
    setIsModalOpen(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-3 flex flex-col md:flex-row md:items-start gap-4">
        {/* Left Sidebar - Profile Card */}
        <div className="hidden md:block md:w-1/4 lg:w-1/5 xl:w-[220px] md:sticky md:top-20">
          <ProfileCard />
        </div>

        {/* Main Feed */}
        <div className="w-full max-w-full md:max-w-[600px] mx-auto flex flex-col items-center">
          {/* Quick Post Creation Card */}
          {user && (
            <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3">
              <div className="flex items-center space-x-3 mb-3">
                <img 
                  src={user.profilePicture ? getMediaUrl(user.profilePicture) : defaultUserAvatar}
                  alt={user.name || "Profile"} 
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {e.target.src = defaultUserAvatar}}
                />
                <button 
                  onClick={handleAddPostClick}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-left rounded-full py-2 px-4 text-sm transition-colors duration-200"
                >
                  What would you like to share today?
                </button>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-100">
                <button 
                  onClick={handleAddPostClick}
                  className="flex items-center justify-center px-4 py-1.5 hover:bg-gray-50 rounded-md transition-colors duration-200 text-sm text-gray-600"
                >
                  <FiImage className="mr-2 text-blue-500" /> Photo
                </button>
                <button 
                  onClick={handleAddPostClick}
                  className="flex items-center justify-center px-4 py-1.5 hover:bg-gray-50 rounded-md transition-colors duration-200 text-sm text-gray-600"
                >
                  <FiVideo className="mr-2 text-green-500" /> Video
                </button>
                <button 
                  onClick={handleAddPostClick}
                  className="flex items-center justify-center px-4 py-1.5 hover:bg-gray-50 rounded-md transition-colors duration-200 text-sm text-gray-600"
                >
                  <FiFileText className="mr-2 text-orange-500" /> Document
                </button>
              </div>
            </div>
          )}
          
          {error && (
            <div className="w-full mb-3 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 shadow-sm">
              <div className="font-medium">Error</div>
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="flex items-center justify-center w-full h-40 bg-white rounded-lg shadow-sm border border-gray-200 my-2">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-b-blue-600 border-gray-200"></div>
                <p className="text-gray-500 text-sm mt-3">Loading your feed...</p>
              </div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200 w-full my-2">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-medium text-gray-800 mb-2">No posts yet</h3>
              <p className="text-gray-500 mb-6">Be the first to share something exciting!</p>
              <button
                onClick={handleAddPostClick}
                className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm"
              >
                Create a Post
              </button>
            </div>
          ) : (
            <div className="w-full space-y-3">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  authorName={post.userName}
                  authorRole="Member"
                  authorImage={post.profilePhotoUrl}
                  content={post.description}
                  mediaUrls={post.mediaUrls}
                  likes={post.likes || 0}
                  comments={post.comments?.length || 0}
                  shares={0}
                  saves={0}
                  hashtags={post.tags}
                  userId={post.userId}
                  currentUserId={user?.id}
                  onPostUpdated={refetchPosts}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar - Learning Progress */}
        <div className="hidden lg:block lg:w-1/4 xl:w-[280px] lg:sticky lg:top-20">
          <LearningProgress />
        </div>

        {/* Add New Post Button - Smaller and only for mobile */}
        <button
          onClick={handleAddPostClick}
          className="md:hidden fixed bottom-6 right-6 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 z-50"
        >
          <div className="relative p-3">
            <FiPlus className="w-6 h-6" />
          </div>
        </button>

        {/* Modal for Adding New Post */}
        {isModalOpen && (
          <Modal onClose={handleModalClose} hideCloseButton={true}>
            <PostForm
              onSubmit={handlePostSubmitSuccess}
              onCancel={handleModalClose}
            />
          </Modal>
        )}
      </div>
    </div>
  );
};

export default Home;