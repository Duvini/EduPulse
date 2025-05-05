import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createUserSlice } from './userSlice';
import { createUiSlice } from './uiSlice';
import { createPostSlice } from './postSlice';
import { createNotificationSlice } from './notificationSlice';
import { createFollowerSlice } from './followerSlice';

// Create store with persistence
const useStore = create(
    persist(
        (set) => ({
            ...createUserSlice(set),
            ...createUiSlice(set),
            ...createPostSlice(set),
            ...createNotificationSlice(set),
            ...createFollowerSlice(set)
        }),
        {
            name: 'edupulse-storage', // unique name for localStorage key
            storage: createJSONStorage(() => localStorage),
            // Only persist the authentication state
            partialize: (state) => ({ 
                user: state.user, 
                isAuthenticated: state.isAuthenticated 
            }),
        }
    )
);

export { useStore };