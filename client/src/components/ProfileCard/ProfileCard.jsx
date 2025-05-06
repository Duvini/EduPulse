import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../../store';
import { getMediaUrl } from '../../services/axiosConfig';
import { useGetFollowerStats } from '../../api/hooks/useFollowers';
import { useGetPostsByUserId } from '../../api/hooks/usePosts';

const ProfileCard = () => {
  const { user } = useStore();
  const [imageError, setImageError] = useState(false);
  const [stats, setStats] = useState({
    postsCount: 0,
    followersCount: 0,
    followingCount: 0
  });

  const defaultProfileImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23CBD5E1"%3E%3Cpath d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z"%3E%3C/path%3E%3C/svg%3E';

  // Use React Query hooks to fetch follower stats and posts data
  const { data: followerStatsData } = useGetFollowerStats(
    user?.id,
    { enabled: !!user?.id }
  );
  
  const { data: userPosts } = useGetPostsByUserId(
    user?.id,
    { enabled: !!user?.id }
  );

  // Update stats when data from React Query hooks changes
  useEffect(() => {
    if (followerStatsData) {
      setStats(prev => ({
        ...prev,
        followersCount: followerStatsData.followersCount || 0,
        followingCount: followerStatsData.followingCount || 0
      }));
    }
    
    if (userPosts) {
      setStats(prev => ({
        ...prev,
        postsCount: userPosts.length || 0
      }));
    }
  }, [followerStatsData, userPosts]);

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4">
        <div className="p-4 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="font-semibold text-lg text-gray-900">Welcome to EduPulse</h3>
          <p className="text-gray-500 text-sm mt-1 mb-4">Sign in to access your profile</p>
          <div className="flex space-x-2 justify-center">
            <Link to="/signin" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium">
              Sign In
            </Link>
            <Link to="/signup" className="px-4 py-2 bg-gray-100 text-gray-800 rounded border border-gray-300 hover:bg-gray-200 text-sm font-medium">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4">
      {/* Profile Info */}
      <div className="px-4 pt-4 pb-4 relative">
        {/* Profile Image */}
        <div className="relative mb-3">
          <Link to="/profile">
            <img 
              src={imageError ? defaultProfileImage : (user?.profilePicture ? getMediaUrl(user.profilePicture) : defaultProfileImage)}
              alt={user.name || "Profile"}
              className="w-20 h-20 rounded-full border-4 border-white object-cover shadow-sm"
              onError={() => setImageError(true)}
            />
          </Link>
        </div>
        
        {/* User Name and Info */}
        <div className="mb-3">
          <Link to="/profile" className="block">
            <h3 className="font-bold text-lg text-gray-900">{user.name || "User"}</h3>
          </Link>
          <p className="text-gray-600 text-sm">{user.headline || `@${user.username}` || ""}</p>
          {user.location && (
            <p className="text-gray-500 text-sm mt-1">{user.location}</p>
          )}
        </div>
        
        {/* LinkedIn-style Connection Stats */}
        <div className="border-t border-gray-200 pt-3 mt-3">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600">Connections</span>
            <Link to="/network" className="text-blue-600 font-medium hover:underline">{stats.followersCount}</Link>
          </div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600">Following</span>
            <Link to="/network/following" className="text-blue-600 font-medium hover:underline">{stats.followingCount}</Link>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Posts</span>
            <Link to="/profile" className="text-blue-600 font-medium hover:underline">{stats.postsCount}</Link>
          </div>
        </div>
        
        {/* LinkedIn-style Actions */}
        <div className="border-t border-gray-200 pt-3 mt-3">
          <Link to="/profile" className="block w-full py-2 bg-blue-600 text-white rounded text-center text-sm font-medium hover:bg-blue-700 transition-colors">
            View Profile
          </Link>
        </div>
        
        {/* LinkedIn-style Premium Features */}
        <div className="border-t border-gray-200 pt-3 mt-3">
          <Link to="/premium" className="flex items-center py-1.5 group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-gray-800 group-hover:text-blue-600 font-medium transition-colors">Upgrade to Premium</span>
          </Link>
          <Link to="/bookmarks" className="flex items-center py-1.5 group mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
            <span className="text-sm text-gray-800 group-hover:text-blue-600 font-medium transition-colors">My Bookmarks</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;