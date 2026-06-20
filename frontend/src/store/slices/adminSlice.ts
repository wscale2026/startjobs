import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AdminState {
  isAuthenticated: boolean;
  adminId: string | null;
  adminName: string | null;
}

const initialState: AdminState = {
  isAuthenticated: false,
  adminId: null,
  adminName: null,
};

export const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    loginAdmin: (state, action: PayloadAction<{ id: string; name: string }>) => {
      state.isAuthenticated = true;
      state.adminId = action.payload.id;
      state.adminName = action.payload.name;
    },
    logoutAdmin: (state) => {
      state.isAuthenticated = false;
      state.adminId = null;
      state.adminName = null;
    },
  },
});

export const { loginAdmin, logoutAdmin } = adminSlice.actions;
export default adminSlice.reducer;
