import React from 'react';
import './commentInput.css';

const CommentInput = () => {
  return (
    <div className="comment-input-container">
      <img src="/api/placeholder/36/36" alt="User" className="user-avatar" />
      <div className="comment-input-wrapper">
        <input 
          type="text" 
          className="comment-input" 
          placeholder="Write your comment..." 
        />
      </div>
      <div className="comment-actions">
        <button className="comment-action-btn">
          <i className="attachment-icon">📎</i>
        </button>
        <button className="comment-action-btn">
          <i className="emoji-icon">😊</i>
        </button>
        <button className="comment-send-btn">
          <i className="send-icon">➤</i>
        </button>
      </div>
    </div>
  );
};

export default CommentInput;