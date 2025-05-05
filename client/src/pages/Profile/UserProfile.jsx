import React, { useState, useEffect } from 'react';
import { useStore } from '../../../store';
import { useParams, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { skillPostService } from '../../services/skillPostService';
import { followerService } from '../../services/followerService';
import { getMediaUrl } from '../../services/axiosConfig';
import { FiUser, FiMail, FiLock, FiEdit2, FiCamera, FiUsers, FiUserCheck, FiUserPlus, FiBookmark, FiThumbsUp, FiMessageSquare } from 'react-icons/fi';
import PostCard from '../../components/PostCard/postCard';
import Modal from '../../components/Modal/Modal';

const defaultProfileImage = '/default-avatar.png';

const UserProfile = () => {
  const { id } = useParams();
  const { user, updateUserProfile } = useStore();
  const [profileUser, setProfileUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('posts');
  const [userPosts, setUserPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [stats, setStats] = useState({
    followersCount: 0,
    followingCount: 0,
    postsCount: 0
  });

  const [savedPosts, setSavedPosts] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (id && id !== user?.id) {
        try {
          const response = await authService.getUserById(id);
          if (!response.error) {
            setProfileUser(response.data);
            setFormData({
              name: response.data.name || '',
              username: response.data.username || '',
              email: response.data.email || '',
            });
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
          setError('Failed to load user profile');
        }
      } else {
        setProfileUser(user);
        setFormData({
          name: user?.name || '',
          username: user?.username || '',
          email: user?.email || '',
        });
      }
    };

    fetchUserProfile();
  }, [id, user]);

  useEffect(() => {
    const initializeProfile = async () => {
      const userId = id || user?.id;
      if (!userId) return;

      setFollowLoading(true);
      try {
        const statsResponse = await followerService.getFollowStats(userId);
        if (!statsResponse.error) {
          setStats(statsResponse.data);
        }

        if (id && id !== user?.id) {
          const statusResponse = await followerService.getFollowStatus(id);
          if (!statusResponse.error) {
            setIsFollowing(statusResponse.data);
          }
        }

        await loadTabData(activeTab, userId);
      } catch (err) {
        console.error('Error initializing profile:', err);
      } finally {
        setFollowLoading(false);
      }
    };

    initializeProfile();
  }, [id, user?.id, activeTab]);

  const loadTabData = async (tab, userId) => {
    try {
      switch (tab) {
        case 'followers': {
          const followersResponse = await followerService.getFollowers(userId);
          if (!followersResponse.error) {
            setFollowers(followersResponse.data);
          }
          break;
        }
        case 'following': {
          const followingResponse = await followerService.getFollowing(userId);
          if (!followingResponse.error) {
            setFollowing(followingResponse.data);
          }
          break;
        }
        case 'posts':
          await fetchUserPosts(userId);
          break;
        case 'saved':
          if (isOwnProfile) {
            await fetchSavedPosts();
          }
          break;
      }
    } catch (err) {
      console.error(`Error loading ${tab} data:`, err);
    }
  };

  const fetchSavedPosts = async () => {
    setLoadingSaved(true);
    try {
      const response = await skillPostService.getSavedPosts();
      if (!response.error) {
        setSavedPosts(response.data);
      } else {
        console.error("Error fetching saved posts:", response.message);
      }
    } catch (err) {
      console.error('Error fetching saved posts:', err);
    } finally {
      setLoadingSaved(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!id) return;

    setFollowLoading(true);
    try {
      const response = isFollowing
        ? await followerService.unfollowUser(id)
        : await followerService.followUser(id);

      if (!response.error) {
        setIsFollowing(!isFollowing);
        // Update follower stats
        const statsResponse = await followerService.getFollowStats(id);
        if (!statsResponse.error) {
          setStats(statsResponse.data);
        }
        // If we're on the followers tab, refresh the list
        if (activeTab === 'followers') {
          const followersResponse = await followerService.getFollowers(id);
          if (!followersResponse.error) {
            setFollowers(followersResponse.data);
          }
        }
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
      setError('Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authService.updateUser(user.id, {
        name: formData.name,
        username: formData.username,
        email: formData.email,
      });

      if (response.error) {
        setError(response.message || 'Failed to update profile');
        return;
      }

      updateUserProfile(response.data);
      setSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.updateUser(user.id, {
        currentPassword: formData.currentPassword,
        password: formData.newPassword,
      });

      if (response.error) {
        setError(response.message || 'Failed to update password');
        return;
      }

      setSuccess('Password updated successfully');
      setIsChangingPassword(false);
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while updating password');
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Image size should be less than 5MB');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await authService.updateProfilePicture(user.id, formData);

      if (response.error) {
        setError(response.message || 'Failed to upload profile picture');
        return;
      }

      updateUserProfile(response.data);
      setSuccess('Profile picture updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while uploading profile picture');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async (userId) => {
    if (!userId) return;

    setLoadingPosts(true);
    try {
      const response = await skillPostService.getUserPosts(userId);
      if (!response.error) {
        setUserPosts(response.data);
        setStats(prev => ({ ...prev, postsCount: response.data.length }));
      }
    } catch (err) {
      console.error('Error fetching user posts:', err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const isOwnProfile = !id || id === user?.id;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-lg overflow-hidden">
        <div className="px-4 sm:px-6 md:px-8 pt-8 flex flex-col md:flex-row items-center md:items-start">
          <div className="relative flex-shrink-0 mb-6 md:mb-0 md:mr-10">
            <div className="relative">
              <img
                src={profileUser?.profilePicture ? getMediaUrl(profileUser.profilePicture) : defaultProfileImage}
                alt="Profile"
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border border-gray-200 bg-gray-100"
              />
              {isOwnProfile && (
                <label className="absolute bottom-2 right-2 p-2 bg-gray-200 rounded-full cursor-pointer hover:bg-gray-300 transition-colors">
                  <FiCamera className="text-lg text-gray-800" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                    disabled={loading}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center mb-4">
              <h2 className="text-2xl font-semibold">{profileUser?.username || ''}</h2>
              
              {!isOwnProfile ? (
                <button
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  className={`mt-3 md:mt-0 md:ml-4 px-5 py-1.5 rounded text-sm font-medium ${
                    isFollowing
                      ? 'bg-gray-100 text-gray-900 border border-gray-300 hover:bg-gray-200'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  } transition-colors duration-200`}
                >
                  {followLoading ? (
                    <div className="w-4 h-4 border-2 border-current rounded-full border-t-transparent animate-spin mx-auto"></div>
                  ) : isFollowing ? (
                    'Following'
                  ) : (
                    'Follow'
                  )}
                </button>
              ) : (
                <div className="flex gap-2 mt-3 md:mt-0 md:ml-4">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-1.5 rounded text-sm font-medium bg-gray-100 text-gray-900 border border-gray-300 hover:bg-gray-200 transition-colors duration-200"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="px-4 py-1.5 rounded text-sm font-medium bg-gray-100 text-gray-900 border border-gray-300 hover:bg-gray-200 transition-colors duration-200"
                  >
                    Change Password
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex justify-center md:justify-start space-x-8 mb-4">
              <div className="text-center">
                <span className="font-semibold">{stats.postsCount || 0}</span>
                <p className="text-sm text-gray-600">posts</p>
              </div>
              <button 
                onClick={() => setActiveTab('followers')}
                className="text-center focus:outline-none"
              >
                <span className="font-semibold">{stats.followersCount || 0}</span>
                <p className="text-sm text-gray-600">followers</p>
              </button>
              <button 
                onClick={() => setActiveTab('following')}
                className="text-center focus:outline-none"
              >
                <span className="font-semibold">{stats.followingCount || 0}</span>
                <p className="text-sm text-gray-600">following</p>
              </button>
            </div>
            
            <div className="text-left hidden md:block">
              <h3 className="font-semibold">{profileUser?.name || ''}</h3>
              {profileUser?.bio && (
                <p className="text-sm mt-1 max-w-lg">{profileUser.bio}</p>
              )}
            </div>
          </div>
        </div>

        <div className="md:hidden px-4 sm:px-6 pb-4 text-left">
          <h3 className="font-semibold">{profileUser?.name || ''}</h3>
          {profileUser?.bio && (
            <p className="text-sm mt-1">{profileUser.bio}</p>
          )}
        </div>

        <div className="border-t border-gray-200 mt-6">
          <div className="flex justify-center">
            <button 
              onClick={() => setActiveTab('posts')}
              className={`px-4 py-3 text-sm font-medium border-t-2 ${
                activeTab === 'posts' 
                  ? 'border-black text-black' 
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              } transition-colors duration-200 uppercase flex items-center`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h4v4H5V5zm0 6h4v4H5v-4zm6-6h4v4h-4V5zm0 6h4v4h-4v-4z" clipRule="evenodd" />
              </svg>
              Posts
            </button>
            {isOwnProfile && (
              <button 
                onClick={() => setActiveTab('saved')}
                className={`px-4 py-3 text-sm font-medium border-t-2 ${
                  activeTab === 'saved' 
                    ? 'border-black text-black' 
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                } transition-colors duration-200 uppercase flex items-center`}
              >
                <FiBookmark className="h-3 w-3 mr-1" />
                Saved
              </button>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {error && (
            <div className="p-4 mb-4 text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 mb-4 text-green-600 bg-green-50 border border-green-200 rounded-lg">
              {success}
            </div>
          )}

          <div className="mt-4">
            {activeTab === 'posts' && (
              <div>
                {loadingPosts ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-t-2 border-b-2 border-gray-500 rounded-full animate-spin"></div>
                  </div>
                ) : userPosts.length === 0 ? (
                  <div className="text-center py-16 text-gray-500">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <p className="text-lg font-light">No posts yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userPosts.map(post => (
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
                        onPostUpdated={() => fetchUserPosts(id || user?.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'saved' && (
              <div>
                {!isOwnProfile ? (
                  <div className="text-center py-16 text-gray-500">
                    <FiLock className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-lg font-light">This collection is private</p>
                  </div>
                ) : loadingSaved ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-t-2 border-b-2 border-gray-500 rounded-full animate-spin"></div>
                  </div>
                ) : savedPosts.length === 0 ? (
                  <div className="text-center py-16 text-gray-500">
                    <FiBookmark className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-lg font-light">No saved posts yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedPosts.map(post => (
                      <PostCard
                        key={post.id}
                        id={post.id}
                        authorName={post.userName || post.authorName}
                        authorRole="Member"
                        authorImage={post.profilePhotoUrl || post.authorImage}
                        content={post.description || post.content}
                        mediaUrls={post.mediaUrls}
                        image={post.image}
                        likes={post.likes || 0}
                        comments={(post.comments && post.comments.length) || 0}
                        shares={0}
                        saves={0}
                        hashtags={post.tags || post.hashtags}
                        userId={post.userId}
                        currentUserId={user?.id}
                        isSaved={true}
                        onPostUpdated={() => fetchSavedPosts()}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'followers' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {followers.length === 0 ? (
                  <div className="col-span-3 text-center py-16 text-gray-500">
                    <FiUsers className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-lg font-light">No followers yet</p>
                  </div>
                ) : (
                  followers.map(follower => (
                    <div key={follower.id} className="flex items-center p-4 bg-white border border-gray-200 rounded">
                      <Link to={`/profile/${follower.id}`} className="flex items-center flex-1">
                        <img
                          src={follower.profilePicture ? getMediaUrl(follower.profilePicture) : defaultProfileImage}
                          alt={follower.name}
                          className="w-12 h-12 rounded-full mr-3 object-cover"
                        />
                        <div>
                          <div className="font-medium text-sm">{follower.username}</div>
                          <div className="text-sm text-gray-500">{follower.name}</div>
                        </div>
                      </Link>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'following' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {following.length === 0 ? (
                  <div className="col-span-3 text-center py-16 text-gray-500">
                    <FiUsers className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-lg font-light">Not following anyone yet</p>
                  </div>
                ) : (
                  following.map(followed => (
                    <div key={followed.id} className="flex items-center p-4 bg-white border border-gray-200 rounded">
                      <Link to={`/profile/${followed.id}`} className="flex items-center flex-1">
                        <img
                          src={followed.profilePicture ? getMediaUrl(followed.profilePicture) : defaultProfileImage}
                          alt={followed.name}
                          className="w-12 h-12 rounded-full mr-3 object-cover"
                        />
                        <div>
                          <div className="font-medium text-sm">{followed.username}</div>
                          <div className="text-sm text-gray-500">{followed.name}</div>
                        </div>
                      </Link>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <Modal onClose={() => setIsEditing(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Profile</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Change Password Modal */}
      {isChangingPassword && (
        <Modal onClose={() => setIsChangingPassword(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Change Password</h2>
            
            <form onSubmit={handlePasswordChange}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </span>
                  ) : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UserProfile;