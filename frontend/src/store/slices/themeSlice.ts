import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ThemeMode = 'light' | 'dark';

interface ThemeState { mode: ThemeMode }

const stored = localStorage.getItem('sj_theme') as ThemeMode | null;
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

const initialState: ThemeState = {
  mode: stored ?? (prefersDark ? 'dark' : 'light'),
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => { state.mode = state.mode === 'light' ? 'dark' : 'light'; },
    setTheme: (state, action: PayloadAction<ThemeMode>) => { state.mode = action.payload; },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
