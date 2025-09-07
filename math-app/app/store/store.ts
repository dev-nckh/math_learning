import { configureStore } from '@reduxjs/toolkit';
import appReducer from './appSlice';

// Create the Redux store
export const store = configureStore({
  reducer: {
    app: appReducer,
  },
});

// Export types for TypeScript support
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;