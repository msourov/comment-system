import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import commentsReducer from './features/comments/commentsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    comments: commentsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
    