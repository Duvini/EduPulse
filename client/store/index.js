import { createStore } from './rootStore';
import { createNotificationSlice } from './notificationSlice';
import { createUserSlice } from './userSlice';
import { createUiSlice } from './uiSlice';
import { createPostSlice } from './postSlice';

export const useStore = createStore((...args) => ({
    ...createNotificationSlice(...args),
    ...createUserSlice(...args),
    ...createUiSlice(...args),
    ...createPostSlice(...args),
}));