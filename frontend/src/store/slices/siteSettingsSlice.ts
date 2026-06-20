import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';

export interface SiteSettingsState {
  site_name: string;
  logo: string | null;
  allow_registrations: boolean;
  maintenance_mode: boolean;
  seo_description?: string;
  seo_keywords?: string;
  loading: boolean;
  error: string | null;
}

const initialState: SiteSettingsState = {
  site_name: 'StartJobs',
  logo: null,
  allow_registrations: true,
  maintenance_mode: false,
  seo_description: '',
  seo_keywords: '',
  loading: true,
  error: null,
};

export const fetchPublicSettings = createAsyncThunk(
  'siteSettings/fetchPublic',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/public-settings/');
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Erreur lors du chargement des paramètres');
    }
  }
);

const siteSettingsSlice = createSlice({
  name: 'siteSettings',
  initialState,
  reducers: {
    updateSettingsLocally: (state, action: PayloadAction<Partial<SiteSettingsState>>) => {
      Object.assign(state, action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.site_name = action.payload.site_name;
        state.logo = action.payload.logo;
        state.allow_registrations = action.payload.allow_registrations;
        state.maintenance_mode = action.payload.maintenance_mode;
        state.seo_description = action.payload.seo_description;
        state.seo_keywords = action.payload.seo_keywords;
      })
      .addCase(fetchPublicSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { updateSettingsLocally } = siteSettingsSlice.actions;
export default siteSettingsSlice.reducer;
