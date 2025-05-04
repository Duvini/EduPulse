import axiosInstance from './axiosConfig';

const API_URL = '/api/v1/skillposts';

export const skillPostService = {
    createPost: async (description, tags, mediaFiles) => {
        const formData = new FormData();
        formData.append('description', description);
        tags.forEach(tag => formData.append('tags', tag));
        if (mediaFiles) {
            Array.from(mediaFiles).forEach(file => formData.append('mediaFiles', file));
        }

        const token = localStorage.getItem('authToken'); // Assuming token is stored in localStorage

        const response = await axiosInstance.post(API_URL, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`, // Add the token here
            },
        });
        return response.data;
    },

    updatePost: async (id, description, tags, mediaFiles) => {
        const formData = new FormData();
        if (description) formData.append('description', description);
        if (tags) tags.forEach(tag => formData.append('tags', tag));
        if (mediaFiles) {
            Array.from(mediaFiles).forEach(file => formData.append('mediaFiles', file));
        }

        const response = await axiosInstance.put(`${API_URL}/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    deletePost: async (id) => {
        const response = await axiosInstance.delete(`${API_URL}/${id}`);
        return response.data;
    },

    getAllPosts: async () => {
        const response = await axiosInstance.get(API_URL);
        return response.data;
    },

    getUserPosts: async (userId) => {
        const response = await axiosInstance.get(`${API_URL}/user/${userId}`);
        return response.data;
    }
};