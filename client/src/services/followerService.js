import axiosInstance from './axiosConfig';

const API_URL = '/api/v1/followers';

export const followerService = {
    followUser: async (userId) => {
        try {
            const response = await axiosInstance.post(`${API_URL}/${userId}/follow`);
            return { error: false, data: response.data };
        } catch (err) {
            console.error('Error following user:', err);
            if (err.response?.status === 401) {
                return { error: true, message: 'Please sign in to follow users' };
            }
            return { error: true, message: err.response?.data?.message || 'Error following user' };
        }
    },

    unfollowUser: async (userId) => {
        try {
            const response = await axiosInstance.delete(`${API_URL}/${userId}/unfollow`);
            return { error: false, data: response.data };
        } catch (err) {
            console.error('Error unfollowing user:', err);
            if (err.response?.status === 401) {
                return { error: true, message: 'Please sign in to unfollow users' };
            }
            return { error: true, message: err.response?.data?.message || 'Error unfollowing user' };
        }
    },

    getFollowers: async (userId) => {
        try {
            const response = await axiosInstance.get(`${API_URL}/${userId}/followers`);
            return { error: false, data: response.data.data || [] };
        } catch (err) {
            console.error('Error fetching followers:', err);
            return { error: true, data: [], message: 'Error fetching followers' };
        }
    },

    getFollowing: async (userId) => {
        try {
            const response = await axiosInstance.get(`${API_URL}/${userId}/following`);
            return { error: false, data: response.data.data || [] };
        } catch (err) {
            console.error('Error fetching following:', err);
            return { error: true, data: [], message: 'Error fetching following' };
        }
    },

    getFollowStats: async (userId) => {
        try {
            const response = await axiosInstance.get(`${API_URL}/${userId}/stats`);
            return { error: false, data: response.data.data || { followersCount: 0, followingCount: 0 } };
        } catch (err) {
            console.error('Error fetching follow stats:', err);
            return { 
                error: true, 
                data: { followersCount: 0, followingCount: 0 }, 
                message: 'Error fetching follow stats' 
            };
        }
    },

    getFollowStatus: async (userId) => {
        try {
            const response = await axiosInstance.get(`${API_URL}/${userId}/status`);
            return { error: false, data: response.data.data || false };
        } catch (err) {
            console.error('Error checking follow status:', err);
            if (err.response?.status === 401) {
                return { error: true, message: 'Please sign in to check follow status' };
            }
            return { error: true, data: false, message: 'Error checking follow status' };
        }
    }
};