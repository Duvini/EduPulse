import axiosInstance from './axiosConfig';

const API_URL = '/api/v1/skillposts';

export const skillPostService = {
    createPost: async (description, tags, mediaFiles) => {
        try {
            const formData = new FormData();
            formData.append('description', description);
            if (tags && Array.isArray(tags)) {
                tags.forEach(tag => formData.append('tags', tag));
            }
            if (mediaFiles) {
                Array.from(mediaFiles).forEach(file => formData.append('mediaFiles', file));
            }

            const response = await axiosInstance.post(API_URL, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
            });
            return { error: false, data: response.data };
        } catch (err) {
            console.error('Error creating post:', err);
            if (err.response?.status === 401) {
                return { error: true, message: 'Please sign in to create a post' };
            }
            return { error: true, message: err.response?.data?.message || 'Error creating post' };
        }
    },

    updatePost: async (id, description, tags, mediaFiles) => {
        try {
            const formData = new FormData();
            if (description !== undefined) formData.append('description', description);
            if (tags && Array.isArray(tags)) {
                tags.forEach(tag => formData.append('tags', tag));
            }
            if (mediaFiles && mediaFiles.length > 0) {
                Array.from(mediaFiles).forEach(file => formData.append('mediaFiles', file));
            }

            const response = await axiosInstance.put(`${API_URL}/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return { error: false, data: response.data };
        } catch (err) {
            console.error('Error updating post:', err);
            if (err.response?.status === 401) {
                return { error: true, message: 'Please sign in to update this post' };
            }
            if (err.response?.status === 403) {
                return { error: true, message: 'You are not authorized to update this post' };
            }
            return { error: true, message: err.response?.data?.message || 'Error updating post' };
        }
    },

    deletePost: async (id) => {
        try {
            const response = await axiosInstance.delete(`${API_URL}/${id}`, {
                headers: {
                    // Ensure we're using JSON content type for non-form requests
                    'Content-Type': 'application/json'
                }
            });
            if (response.status === 204) {
                return { error: false, data: null };
            }
            return { error: false, data: response.data };
        } catch (err) {
            console.error('Error deleting post:', err);
            if (err.response?.status === 401) {
                return { error: true, message: 'Please sign in to delete this post' };
            }
            if (err.response?.status === 403) {
                return { error: true, message: 'You are not authorized to delete this post' };
            }
            return { error: true, message: err.response?.data?.message || 'Error deleting post' };
        }
    },

    getAllPosts: async () => {
        try {
            const response = await axiosInstance.get(API_URL);
            return { error: false, data: response.data.data || [] };
        } catch (err) {
            console.error('Error fetching posts:', err);
            if (err.response?.status === 401) {
                return { error: true, data: [], message: 'Please sign in to view posts' };
            }
            return { error: true, data: [], message: 'Error fetching posts' };
        }
    },

    getUserPosts: async (userId) => {
        try {
            const response = await axiosInstance.get(`${API_URL}/user/${userId}`);
            return { error: false, data: response.data.data || [] };
        } catch (err) {
            console.error('Error fetching user posts:', err);
            if (err.response?.status === 401) {
                return { error: true, data: [], message: 'Please sign in to view posts' };
            }
            return { error: true, data: [], message: 'Error fetching user posts' };
        }
    }
};