import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PostCard from '../../components/PostCard/postCard';
import ProfileCard from '../../components/ProfileCard/ProfileCard';
import LearningProgress from '../../components/LearningProgress/LearningProgress';
import PostForm from '../../components/CommentInput/PostForm';
import Modal from '../../components/Modal/Modal';
import { skillPostService } from '../../services/skillPostService';
import { useStore } from '../../../store';
import { FiPlus } from 'react-icons/fi';

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useStore();
  const navigate = useNavigate();

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await skillPostService.getAllPosts();
      if (response.error) {
        setError(response.message || 'Failed to fetch posts');
        if (response.message?.toLowerCase().includes('sign in')) {
          navigate('/signin');
        }
        return;
      }
      setPosts(response.data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to fetch posts. Please try again.');
      if (error.response?.status === 401) {
        navigate('/signin');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

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

  const handlePostSubmitSuccess = async (values) => {
    try {
      const { description, tags, files } = values;
      const tagArray = tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];
      
      const response = await skillPostService.createPost(description, tagArray, files);
      
      if (response.error) {
        if (response.message?.toLowerCase().includes('sign in') || 
            response.message?.toLowerCase().includes('unauthorized') || 
            response.message?.toLowerCase().includes('expired')) {
          navigate('/signin');
        } else {
          setError(response.message || 'Failed to create post. Please try again.');
        }
        return;
      }
      
      setIsModalOpen(false);
      setError(null);
      fetchPosts(); // Refresh posts after creating a new one
    } catch (error) {
      console.error('Error creating post:', error);
      if (error.response?.status === 401) {
        navigate('/signin');
      } else {
        setError('Failed to create post. Please try again.');
      }
    }
  };

  const handlePostUpdate = useCallback(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 flex flex-col md:flex-row md:items-start">
      {/* Left Sidebar - Profile Card */}
      <div className="hidden md:block md:w-1/4 lg:w-1/5 xl:w-[220px] md:sticky md:top-20 space-y-4">
        <ProfileCard />
      </div>

      {/* Main Feed */}
      <div className="w-full max-w-full md:max-w-[600px] mx-auto flex flex-col items-center md:mx-4">
        {error && (
          <div className="w-full mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="flex items-center justify-center w-full h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No posts yet. Be the first to share something!
          </div>
        ) : (
          posts.map((post) => (
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
              onPostUpdated={handlePostUpdate}
            />
          ))
        )}
      </div>

      {/* Right Sidebar - Learning Progress */}
      <div className="hidden lg:block lg:w-1/4 xl:w-[280px] lg:sticky lg:top-20 space-y-4">
        <LearningProgress />
      </div>

      {/* Add New Post Button */}
      <button
        onClick={handleAddPostClick}
        className="fixed bottom-8 right-8 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 group z-50"
      >
        <div className="relative p-4">
          <FiPlus className="w-6 h-6 transform group-hover:rotate-90 transition-transform duration-200" />
          <span className="absolute top-1/2 -translate-y-1/2 right-full mr-2 bg-gray-900 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity duration-200">
            Create Post
          </span>
        </div>
      </button>

      {/* Modal for Adding New Post */}
      {isModalOpen && (
        <Modal onClose={handleModalClose}>
          <PostForm
            onSubmit={handlePostSubmitSuccess}
            onCancel={handleModalClose}
          />
        </Modal>
      )}
    </div>
  );
};

export default Home;