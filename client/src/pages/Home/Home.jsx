import React, { useState, useEffect } from 'react';
import PostCard from '../../components/PostCard/postCard';
import ProfileCard from '../../components/ProfileCard/ProfileCard';
import LearningProgress from '../../components/LearningProgress/LearningProgress.jsx';
import PostForm from '../../components/CommentInput/PostForm';
import Modal from '../../components/Modal/Modal';
import { skillPostService } from '../../services/skillPostService';
import { useStore } from '../../../store';

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useStore();

  const fetchPosts = async () => {
    try {
      const response = await skillPostService.getAllPosts();
      if (!response.error) {
        setPosts(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleAddPostClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handlePostSubmitSuccess = async (values) => {
    try {
        const formData = new FormData();
        formData.append('description', values.description);

        if (values.tags) {
            const tagArray = values.tags.split(',').map(tag => tag.trim()).filter(Boolean);
            tagArray.forEach(tag => formData.append('tags', tag));
        }

        if (values.files) {
            Array.from(values.files).forEach(file => {
                formData.append('mediaFiles', file);
            });
        }

        await skillPostService.createPost(formData);
        setIsModalOpen(false);
        fetchPosts(); // Refresh posts after creating a new one
    } catch (error) {
        console.error('Error creating post:', error);

        if (error.response?.status === 401) {
            alert('Session expired. Please log in again.');
            // Redirect to login page
            window.location.href = '/signin';
        } else {
            alert('Failed to create post. Please try again.');
        }
    }
};

  return (
    <div className="w-full max-w-7xl mx-auto p-4 flex flex-col md:flex-row md:items-start">
      {/* Left Sidebar - Profile Card */}
      <div className="hidden md:block md:w-1/4 lg:w-1/5 xl:w-[220px] md:sticky md:top-20 space-y-4">
        <ProfileCard />
      </div>

      {/* Main Feed */}
      <div className="w-full max-w-full md:max-w-[600px] mx-auto flex flex-col items-center md:mx-4">
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
              onPostUpdated={fetchPosts}
              onSubmit={handlePostSubmitSuccess}
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
        className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        +
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