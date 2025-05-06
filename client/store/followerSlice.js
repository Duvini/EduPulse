export const createFollowerSlice = (set) => ({
    followers: [],
    following: [],
    isFollowing: false,
    stats: {
        followersCount: 0,
        followingCount: 0
    },
    loading: false,

    // Actions
    setFollowers: (followers) => set({ followers }),
    setFollowing: (following) => set({ following }),
    setIsFollowing: (isFollowing) => set({ isFollowing }),
    setStats: (stats) => set({ stats }),
    setLoading: (loading) => set({ loading }),

    // Reset state
    resetFollowerState: () => set({
        followers: [],
        following: [],
        isFollowing: false,
        stats: {
            followersCount: 0,
            followingCount: 0
        },
        loading: false
    })
});