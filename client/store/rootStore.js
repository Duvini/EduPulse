import { create } from 'zustand';
import { createUserSlice } from './userSlice';
import { createUiSlice } from './uiSlice';
import { createPostSlice } from './postSlice';
import { createNotificationSlice } from './notificationSlice';
import { createFollowerSlice } from './followerSlice';

const useStore = create((set) => ({
    ...createUserSlice(set),
    ...createUiSlice(set),
    ...createPostSlice(set),
    ...createNotificationSlice(set),
    ...createFollowerSlice(set)
}));

export { useStore };