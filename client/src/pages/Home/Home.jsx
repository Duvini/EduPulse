import React from 'react';
import PostCard from '../../components/PostCard/postCard';
import './Home.css';

const Home = () => {
  const posts = [
    {
      id: 1,
      authorName: 'X_AE_A-13',
      authorRole: 'Product Designer, slothUI',
      authorImage: '/api/placeholder/40/40',
      content: 'Habitant morbi tristique senectus et netus et. Suspendisse sed nisi lacus sed viverra. Dolor morbi non arcu risus quis varius.',
      image: '/api/placeholder/600/400',
      likes: 12,
      comments: 25,
      shares: 187,
      saves: 8,
      hashtags: ['amazing', 'great', 'lifetime', 'flux', 'machinelearning']
    },
    {
      id: 2,
      authorName: 'X_AE_A-13',
      authorRole: 'Product Designer, slothUI',
      authorImage: '/api/placeholder/40/40',
      content: 'Habitant morbi tristique senectus et netus et. Suspendisse sed nisi lacus sed viverra. Dolor morbi non arcu risus quis varius.',
      likes: 8,
      comments: 12,
      shares: 45,
      saves: 3,
      hashtags: ['design', 'ui', 'ux']
    }
  ];

  return (
    <div className="feed-container">
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
  );
};

export default Home;