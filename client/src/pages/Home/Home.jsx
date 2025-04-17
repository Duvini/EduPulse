import React from 'react';
import PostCard from '../../components/PostCard/postCard';
import { posts } from '../../constants/dummyData.js'; //api integration
import ProfileCard from '../../components/ProfileCard/ProfileCard';
import LearningProgress from '../../components/LearningProgress/LearningProgress.jsx';

const Home = () => {
  return (
    <div className="w-full max-w-7xl mx-auto p-2.5 sm:p-4 flex flex-col md:flex-row md:items-start">
      {/* Left Sidebar - Profile Card (hidden on mobile) */}
      <div className="hidden md:block md:w-1/4 lg:w-1/5 xl:w-[220px] md:sticky md:top-20 space-y-4">
        <ProfileCard />
      </div>
      
      {/* Main Feed */}
      <div className="w-full max-w-full md:max-w-[600px] mx-auto flex flex-col items-center md:mx-4">
        {posts.map(post => (
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
      
      {/* Right Sidebar - Learning Progress & News */}
      <div className="hidden lg:block lg:w-1/4 xl:w-[280px] lg:sticky lg:top-20 space-y-4">
        <LearningProgress />
        
        {/* News Widget */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-base font-semibold">EduPulse News</h3>
          </div>
          <div className="px-4 py-2 divide-y divide-gray-100">
            <div className="py-2">
              <p className="text-sm font-medium">New course: Introduction to AI</p>
              <p className="text-xs text-gray-500">1,254 enrolled</p>
            </div>
            <div className="py-2">
              <p className="text-sm font-medium">Upcoming webinar: Future of EdTech</p>
              <p className="text-xs text-gray-500">Tomorrow, 3:00 PM</p>
            </div>
            <div className="py-2">
              <p className="text-sm font-medium">Learning tip: Spaced repetition</p>
              <p className="text-xs text-gray-500">Improve retention by 40%</p>
            </div>
          </div>
          <div className="px-4 py-3 text-center border-t border-gray-200">
            <button className="text-sm text-blue-600 font-medium hover:text-blue-800">
              Show more
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;