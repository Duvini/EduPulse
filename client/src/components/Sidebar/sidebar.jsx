import React from 'react';
import './sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-letter">E</span>
          <span className="logo-text">EduPulse</span>
        </div>
      </div>
      
      <div className="search-container">
        <div className="search-box">
          <i className="search-icon">🔍</i>
          <input type="text" placeholder="Search" className="search-input" />
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          <li className="nav-item active">
            <i className="nav-icon">🏠</i>
            <span className="nav-text">Feed</span>
            <span className="nav-badge">10</span>
          </li>
          <li className="nav-item">
            <i className="nav-icon">📚</i>
            <span className="nav-text">Learn Plans</span>
          </li>
          <li className="nav-item">
            <i className="nav-icon">👥</i>
            <span className="nav-text">Friends</span>
            <span className="nav-badge">2</span>
          </li>
          
          <li className="nav-item">
            <i className="nav-icon">💳</i>
            <span className="nav-text">Subscription</span>
          </li>
          <li className="nav-item">
            <i className="nav-icon">⚙️</i>
            <span className="nav-text">Settings</span>
          </li>
          <li className="nav-item">
            <i className="nav-icon">❓</i>
            <span className="nav-text">Help & Support</span>
          </li>
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        <div className="pro-button">
          <button className="go-pro-btn">Go Pro</button>
          <i className="star-icon">⭐</i>
        </div>
        
        <div className="user-profile">
          <div className="avatar">
            <img src="/api/placeholder/40/40" alt="User avatar" className="avatar-img" />
          </div>
          <div className="user-info">
            <div className="username">Azunyan U. Wu</div>
            <div className="user-role">Basic Member</div>
          </div>
          <div className="menu-icon">→</div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;