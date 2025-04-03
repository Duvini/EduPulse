import React from 'react';
import './postCard.css'; 
import CommentInput from '../CommentInput/commentInput'; 

const PostCard = ({ authorName, authorRole, authorImage, content, image, likes, comments, shares, saves, hashtags }) => {
  return (
    <div className="post-card">
      {/* Post Header */}
      <div className="post-header">
        <div className="author-info">
          <img src={authorImage || "/api/placeholder/40/40"} alt="Author" className="author-image" />
          <div className="author-details">
            <h4 className="author-name">{authorName}</h4>
            <p className="author-role">{authorRole}</p>
          </div>
        </div>
        <button className="more-options-btn">
          <i className="more-icon">⋮</i>
        </button>
      </div>

      {/* Post Content */}
      <div className="post-content">
        <p className="post-text">{content}</p>
        {hashtags && (
          <div className="hashtags">
            {hashtags.map((tag, index) => (
              <span key={index} className="hashtag">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Post Image */}
      {image && (
        <div className="post-image-container">
          <img src={image} alt="Post content" className="post-image" />
        </div>
      )}

      {/* Post Engagement */}
      <div className="post-engagement">
        <div className="engagement-item">
          <button className="engagement-btn">
            <i className="like-icon">👍</i>
          </button>
          <span>{likes || 0} Likes</span>
        </div>
        <div className="engagement-item">
          <button className="engagement-btn">
            <i className="comment-icon">💬</i>
          </button>
          <span>{comments || 0} Comments</span>
        </div>
        <div className="engagement-item">
          <button className="engagement-btn">
            <i className="share-icon">↗️</i>
          </button>
          <span>{shares || 0} Share</span>
        </div>
        <div className="engagement-item">
          <button className="engagement-btn">
            <i className="save-icon">🔖</i>
          </button>
          <span>{saves || 0} Saved</span>
        </div>
      </div>

      {/* Comment Input */}
      <CommentInput />
    </div>
  );
};

export default PostCard;