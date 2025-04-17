export const createUiSlice = (set) => ({
    isMobileMenuOpen: false,
    isSearchFocused: false,

    // Actions
    toggleMobileMenu: () => set((state) => ({
        isMobileMenuOpen: !state.isMobileMenuOpen
    })),

    closeMobileMenu: () => set({
        isMobileMenuOpen: false
    }),

    setSearchFocused: (focused) => set({
        isSearchFocused: focused
    }),
});