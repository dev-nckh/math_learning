import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Example slice for app state
interface AppState {
  isLoading: boolean;
  user: {
    name: string;
    id: string | null;
  } | null;
}

const initialState: AppState = {
  isLoading: false,
  user: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setUser: (state, action: PayloadAction<AppState['user']>) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    },
  },
});

export const { setLoading, setUser, clearUser } = appSlice.actions;
export default appSlice.reducer;