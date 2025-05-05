import React, { useState } from 'react';
import PostCard from '../../components/PostCard/postCard';
import { posts } from '../../constants/dummyData.js'; // Replace with API integration
import ProfileCard from '../../components/ProfileCard/ProfileCard';
import LearningProgress from '../../components/LearningProgress/LearningProgress.jsx';
import PostForm from '../../components/CommentInput/PostForm'; // Correct import for PostForm
import Modal from '../../components/Modal/Modal'; // Ensure this file exists

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddPostClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handlePostSubmitSuccess = (newPost) => {
    console.log('New post added:', newPost);
    setIsModalOpen(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 flex flex-col md:flex-row md:items-start">
      {/* Left Sidebar - Profile Card */}
      <div className="hidden md:block md:w-1/4 lg:w-1/5 xl:w-[220px] md:sticky md:top-20 space-y-4">
        <ProfileCard />
      </div>

      {/* Main Feed */}
      <div className="w-full max-w-full md:max-w-[600px] mx-auto flex flex-col items-center md:mx-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            authorName={post.authorName}
            authorRole={post.authorRole}
            authorImage={post.authorImage}
            content={post.content}
            image={post.image}
            likes={post.likes}
            comments={post.comments}
            shares={post.shares}
            saves={post.saves}
            hashtags={post.hashtags}
          />
        ))}
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
            onSubmit={(values) => {
              console.log('Post submitted:', values);
              handlePostSubmitSuccess(values);
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export default Home;