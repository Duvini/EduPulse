import React from 'react';
import PostCard from '../../components/PostCard/postCard';
import './Home.css';
import {
  posts
  } from '../../constants/dummyData.js';//api integration


const Home = () => {
  

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