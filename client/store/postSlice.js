export const createPostSlice = (set) => ({
    likedPosts: [],
    savedPosts: [],
    activePostMenu: null,

    togglePostMenu: (postId) => set(state => ({
        activePostMenu: state.activePostMenu === postId ? null : postId
    })),

    closeAllPostMenus: () => set({
        activePostMenu: null
    }),

    likePost: (postId) => set(state => ({
        likedPosts: [...state.likedPosts, postId]
    })),

    unlikePost: (postId) => set(state => ({
        likedPosts: state.likedPosts.filter(id => id !== postId)
    })),

    savePost: (postId) => set(state => ({
        savedPosts: [...state.savedPosts, postId]
    })),

    unsavePost: (postId) => set(state => ({
        savedPosts: state.savedPosts.filter(id => id !== postId)
    })),

    addComment: (postId, comment) => {
        // TODO: Integrate with backend API to add comment
        console.log(`Adding comment to post ${postId}:`, comment);
    }
});