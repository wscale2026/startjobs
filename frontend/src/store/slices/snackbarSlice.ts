import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SnackbarMessage {
  id: string;
  message: string;
  severity: 'success' | 'info' | 'warning' | 'error';
}

interface SnackbarState {
  queue: SnackbarMessage[];
}

const initialState: SnackbarState = { queue: [] };

export const snackbarSlice = createSlice({
  name: 'snackbar',
  initialState,
  reducers: {
    showSnackbar: (state, action: PayloadAction<Omit<SnackbarMessage, 'id'>>) => {
      state.queue.push({ ...action.payload, id: Date.now().toString() });
    },
    dismissSnackbar: (state, action: PayloadAction<string>) => {
      state.queue = state.queue.filter((m) => m.id !== action.payload);
    },
    clearAll: (state) => { state.queue = []; },
  },
});

export const { showSnackbar, dismissSnackbar, clearAll } = snackbarSlice.actions;
export default snackbarSlice.reducer;
