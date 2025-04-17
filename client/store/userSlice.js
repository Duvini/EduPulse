export const createUserSlice = (set) => ({
    user: null,
    isAuthenticated: false,

    // Actions
    setUser: (user) => set({
        user,
        isAuthenticated: !!user
    }),

    logout: () => set({
        user: null,
        isAuthenticated: false
    }),

    updateUserProfile: (updatedFields) => set((state) => ({
        user: { ...state.user, ...updatedFields }
    })),
});