import React, { useState, useEffect } from 'react';
import { useStore } from '../../../store';
import { useParams, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { skillPostService } from '../../services/skillPostService';
import { followerService } from '../../services/followerService';
import { getMediaUrl } from '../../services/axiosConfig';
import { FiUser, FiMail, FiLock, FiEdit2, FiCamera, FiUsers, FiUserCheck, FiUserPlus } from 'react-icons/fi';
import PostCard from '../../components/PostCard/postCard';

const UserProfile = () => {
  const { id } = useParams();
  const { user, updateUserProfile } = useStore();
  const {
    followers,
    following,
    stats,
    isFollowing,
    loading: followLoading,
    setFollowers,
    setFollowing,
    setStats,
    setIsFollowing,
    setLoading: setFollowLoading
  } = useStore();

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [profileUser, setProfileUser] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const defaultProfileImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23CBD5E1"%3E%3Cpath d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z"%3E%3C/path%3E%3C/svg%3E';

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

        if (activeTab === 'followers') {
          const followersResponse = await followerService.getFollowers(userId);
          if (!followersResponse.error) {
            setFollowers(followersResponse.data);
          }
        } else if (activeTab === 'following') {
          const followingResponse = await followerService.getFollowing(userId);
          if (!followingResponse.error) {
            setFollowing(followingResponse.data);
          }
        }
      } catch (err) {
        console.error('Error initializing profile:', err);
      } finally {
        setFollowLoading(false);
      }
    };

    initializeProfile();
  }, [id, user?.id, activeTab]);

  const handleTabChange = async (tab) => {
    setActiveTab(tab);
    const userId = id || user?.id;
    if (!userId) return;

    setFollowLoading(true);
    try {
      if (tab === 'followers') {
        const response = await followerService.getFollowers(userId);
        if (!response.error) {
          setFollowers(response.data);
        }
      } else if (tab === 'following') {
        const response = await followerService.getFollowing(userId);
        if (!response.error) {
          setFollowing(response.data);
        }
      }
    } catch (err) {
      console.error(`Error fetching ${tab}:`, err);
    } finally {
      setFollowLoading(false);
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
        setStats(response.data);
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

  const fetchUserPosts = async () => {
    const userId = id || user?.id;
    if (!userId) return;

    setLoadingPosts(true);
    try {
      const response = await skillPostService.getUserPosts(userId);
      if (!response.error) {
        // Only set posts if we're viewing our own profile or if we're viewing someone else's profile
        if (!id || id === user?.id) {
          // For own profile
          setUserPosts(response.data);
        } else {
          // For other user's profile
          setUserPosts(response.data);
        }
        setStats(prev => ({ ...prev, postsCount: response.data.length }));
      }
    } catch (err) {
      console.error('Error fetching user posts:', err);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchUserPosts();
  }, [id, user?.id]);

  const isOwnProfile = !id || id === user?.id;

  return (
    <div className="max-w-4xl p-4 mx-auto sm:p-6 lg:p-8">
      <div className="overflow-hidden bg-white rounded-lg shadow-md">
        <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
          <div className="absolute transform -translate-x-1/2 left-1/2 -bottom-16">
            <div className="relative">
              <img
                src={profileUser?.profilePicture ? getMediaUrl(profileUser.profilePicture) : defaultProfileImage}
                alt="Profile"
                className="object-cover w-32 h-32 bg-gray-100 border-4 border-white rounded-full"
              />
              {isOwnProfile && (
                <label className="absolute bottom-0 right-0 p-2 transition-colors bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700">
                  <FiCamera className="text-xl text-white" />
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
        </div>

        <div className="px-6 pt-20 pb-4 border-b">
          <div className="mb-4 text-center">
            <h2 className="text-2xl font-bold">{profileUser?.name}</h2>
            <p className="text-gray-600">@{profileUser?.username}</p>
            {!isOwnProfile && (
              <button
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`mt-4 inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                  isFollowing
                    ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } transition-colors duration-200`}
              >
                {followLoading ? (
                  <div className="w-5 h-5 border-2 border-current rounded-full border-t-transparent animate-spin"></div>
                ) : isFollowing ? (
                  <>
                    <FiUserCheck className="mr-2" />
                    Following
                  </>
                ) : (
                  <>
                    <FiUserPlus className="mr-2" />
                    Follow
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex justify-center space-x-8">
            <button 
              onClick={() => handleTabChange('posts')}
              className={`text-center transition-colors duration-200 ${
                activeTab === 'posts' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="text-xl font-semibold">{stats.postsCount}</div>
              <div>Posts</div>
            </button>
            <button 
              onClick={() => handleTabChange('followers')}
              className={`text-center transition-colors duration-200 ${
                activeTab === 'followers' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="text-xl font-semibold">{stats.followersCount}</div>
              <div>Followers</div>
            </button>
            <button 
              onClick={() => handleTabChange('following')}
              className={`text-center transition-colors duration-200 ${
                activeTab === 'following' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="text-xl font-semibold">{stats.followingCount}</div>
              <div>Following</div>
            </button>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="p-4 mb-4 text-red-600 border border-red-200 rounded-lg bg-red-50">
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 mb-4 text-green-600 border border-green-200 rounded-lg bg-green-50">
              {success}
            </div>
          )}

          {followLoading ? (
            <div className="py-8 text-center">
              <div className="inline-block w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {activeTab === 'posts' && (
                <div className="space-y-4">
                  {loadingPosts ? (
                    <div className="py-8 text-center">
                      <div className="inline-block w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                    </div>
                  ) : userPosts.length === 0 ? (
                    <div className="py-8 text-center text-gray-500">
                      No posts yet
                    </div>
                  ) : (
                    userPosts.map(post => (
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
                        onPostUpdated={fetchUserPosts}
                      />
                    ))
                  )}
                </div>
              )}

              {activeTab === 'followers' && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {followers.length === 0 ? (
                    <div className="col-span-2 py-8 text-center text-gray-500">
                      No followers yet
                    </div>
                  ) : (
                    followers.map(follower => (
                      <div key={follower.id} className="flex items-center p-4 rounded-lg bg-gray-50">
                        <Link to={`/profile/${follower.id}`} className="flex items-center flex-1">
                          <img
                            src={follower.profilePicture || defaultProfileImage}
                            alt={follower.name}
                            className="w-12 h-12 mr-4 rounded-full"
                          />
                          <div>
                            <div className="font-semibold">{follower.name}</div>
                            <div className="text-sm text-gray-600">@{follower.username}</div>
                          </div>
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'following' && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {following.length === 0 ? (
                    <div className="col-span-2 py-8 text-center text-gray-500">
                      Not following anyone yet
                    </div>
                  ) : (
                    following.map(followed => (
                      <div key={followed.id} className="flex items-center p-4 rounded-lg bg-gray-50">
                        <Link to={`/profile/${followed.id}`} className="flex items-center flex-1">
                          <img
                            src={followed.profilePicture || defaultProfileImage}
                            alt={followed.name}
                            className="w-12 h-12 mr-4 rounded-full"
                          />
                          <div>
                            <div className="font-semibold">{followed.name}</div>
                            <div className="text-sm text-gray-600">@{followed.username}</div>
                          </div>
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}

          {isOwnProfile && isEditing && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FiUser className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing || loading}
                      className="block w-full py-2 pl-10 pr-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FiUser className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      disabled={!isEditing || loading}
                      className="block w-full py-2 pl-10 pr-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FiMail className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing || loading}
                      className="block w-full py-2 pl-10 pr-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {isOwnProfile && isChangingPassword && (
            <div className="pt-8 mt-8 border-t border-gray-200">
              <h3 className="mb-4 text-lg font-medium text-gray-900">Change Password</h3>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Current Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FiLock className="text-gray-400" />
                    </div>
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      required
                      className="block w-full py-2 pl-10 pr-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FiLock className="text-gray-400" />
                    </div>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      required
                      className="block w-full py-2 pl-10 pr-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FiLock className="text-gray-400" />
                    </div>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="block w-full py-2 pl-10 pr-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsChangingPassword(false)}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {isOwnProfile && !isEditing && !isChangingPassword && (
            <div className="flex justify-end mt-6 space-x-3">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiEdit2 className="mr-2" />
                Edit Profile
              </button>
              <button
                type="button"
                onClick={() => setIsChangingPassword(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <FiLock className="mr-2" />
                Change Password
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;