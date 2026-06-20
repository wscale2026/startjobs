import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export interface ApiApplication {
  id: number;
  candidate: any;
  job_offer: any;
  status: string;
  match_score: number;
  created_at: string;
}

interface ApplicationsState {
  items: ApiApplication[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ApplicationsState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchApplications = createAsyncThunk('applications/fetchApplications', async () => {
  const response = await api.get('applications/');
  return response.data;
});

export const createApplication = createAsyncThunk('applications/createApplication', async (jobOfferId: number) => {
  const response = await api.post('applications/', { job_offer_id: jobOfferId });
  return response.data;
});

export const updateApplicationStatus = createAsyncThunk(
  'applications/updateStatus',
  async ({ id, status }: { id: number; status: string }) => {
    const response = await api.patch(`applications/${id}/`, { status });
    return response.data;
  }
);

export const deleteApplication = createAsyncThunk('applications/deleteApplication', async (id: number) => {
  await api.delete(`applications/${id}/`);
  return id;
});

const applicationsSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchApplications.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchApplications.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchApplications.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch applications';
      })
      .addCase(createApplication.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateApplicationStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex(app => app.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteApplication.fulfilled, (state, action) => {
        state.items = state.items.filter((app) => app.id !== action.payload);
      });
  },
});

export default applicationsSlice.reducer;
