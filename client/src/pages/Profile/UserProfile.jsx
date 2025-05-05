import React, { useState, useEffect } from 'react';
import { useStore } from '../../../store';
import { useParams, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { skillPostService } from '../../services/skillPostService';
import { followerService } from '../../services/followerService';
import { getMediaUrl } from '../../services/axiosConfig';
import { FiUser, FiMail, FiLock, FiEdit2, FiCamera, FiUsers, FiUserCheck, FiUserPlus } from 'react-icons/fi';
import PostCard from '../../components/PostCard/postCard';

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
        case 'followers':
          const followersResponse = await followerService.getFollowers(userId);
          if (!followersResponse.error) {
            setFollowers(followersResponse.data);
          }
          break;
        case 'following':
          const followingResponse = await followerService.getFollowing(userId);
          if (!followingResponse.error) {
            setFollowing(followingResponse.data);
          }
          break;
        case 'posts':
          await fetchUserPosts(userId);
          break;
      }
    } catch (err) {
      console.error(`Error loading ${tab} data:`, err);
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
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
          <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16">
            <div className="relative">
              <img
                src={profileUser?.profilePicture ? getMediaUrl(profileUser.profilePicture) : defaultProfileImage}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-white bg-gray-100"
              />
              {isOwnProfile && (
                <label className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
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
          <div className="text-center mb-4">
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
              onClick={() => setActiveTab('posts')}
              className={`text-center transition-colors duration-200 ${
                activeTab === 'posts' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="text-xl font-semibold">{stats.postsCount || 0}</div>
              <div>Posts</div>
            </button>
            <button 
              onClick={() => setActiveTab('followers')}
              className={`text-center transition-colors duration-200 ${
                activeTab === 'followers' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="text-xl font-semibold">{stats.followersCount || 0}</div>
              <div>Followers</div>
            </button>
            <button 
              onClick={() => setActiveTab('following')}
              className={`text-center transition-colors duration-200 ${
                activeTab === 'following' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="text-xl font-semibold">{stats.followingCount || 0}</div>
              <div>Following</div>
            </button>
          </div>
        </div>

        <div className="p-6">
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

          {/* Tabs Content */}
          <div className="mt-4">
            {activeTab === 'posts' && (
              <div className="space-y-4">
                {loadingPosts ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
                  </div>
                ) : userPosts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
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
                      onPostUpdated={() => fetchUserPosts(id || user?.id)}
                    />
                  ))
                )}
              </div>
            )}

            {activeTab === 'followers' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {followers.length === 0 ? (
                  <div className="col-span-2 text-center py-8 text-gray-500">
                    No followers yet
                  </div>
                ) : (
                  followers.map(follower => (
                    <div key={follower.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                      <Link to={`/profile/${follower.id}`} className="flex items-center flex-1">
                        <img
                          src={follower.profilePicture ? getMediaUrl(follower.profilePicture) : defaultProfileImage}
                          alt={follower.name}
                          className="w-12 h-12 rounded-full mr-4"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {following.length === 0 ? (
                  <div className="col-span-2 text-center py-8 text-gray-500">
                    Not following anyone yet
                  </div>
                ) : (
                  following.map(followed => (
                    <div key={followed.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                      <Link to={`/profile/${followed.id}`} className="flex items-center flex-1">
                        <img
                          src={followed.profilePicture ? getMediaUrl(followed.profilePicture) : defaultProfileImage}
                          alt={followed.name}
                          className="w-12 h-12 rounded-full mr-4"
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;