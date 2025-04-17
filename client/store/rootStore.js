import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export const createStore = (createState) => {
    return create(
        devtools(
            persist(
                createState,
                {
                    name: 'edupulse-storage',
                    partialize: (state) => ({
                        user: state.user,
                        unreadNotificationCount: state.unreadNotificationCount,
                        likedPosts: state.likedPosts,
                        savedPosts: state.savedPosts,
                    }),
                }
            )
        )
    );
};