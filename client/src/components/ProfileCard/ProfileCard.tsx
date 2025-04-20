import React from 'react';
import { Link } from 'react-router-dom';

const ProfileCard = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
      {/* Banner and Profile Image */}
      <div className="relative">
        {/* Banner */}
        <div className="h-16 bg-gradient-to-r from-blue-500 to-purple-600"></div>
        
        {/* Profile Image */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-8">
          <img 
            src="/api/placeholder/72/72" 
            alt="Profile" 
            className="w-16 h-16 rounded-full border-4 border-white object-cover"
          />
        </div>
      </div>
      
      {/* User Info */}
      <div className="pt-10 px-4 pb-4 text-center">
        <h3 className="text-lg font-bold mb-0.5">Azunyan U. Wu</h3>
        <p className="text-gray-500 text-sm mb-3">Software Engineer at TechCorp</p>
        
        <div className="border-t border-b border-gray-200 py-2 mb-2">
          <div className="flex justify-between text-xs text-gray-600">
            <div>
              <p className="mb-1">Who viewed your profile</p>
              <p className="text-blue-600 font-semibold">48</p>
            </div>
            <div>
              <p className="mb-1">Post impressions</p>
              <p className="text-blue-600 font-semibold">127</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 -mx-4 px-4 py-2 text-left border-b border-gray-200">
          <Link to="/premium" className="flex items-center text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-2 text-yellow-500">
              <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3A5.25 5.25 0 0012 1.5zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold">Upgrade to Premium</span>
          </Link>
        </div>
        
        <div className="bg-gray-50 -mx-4 px-4 py-2 text-left">
          <Link to="/bookmarks" className="flex items-center text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-2">
              <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z" clipRule="evenodd" />
            </svg>
            <span>My Bookmarks</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;