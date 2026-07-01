import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

interface TaxonomyState {
  skills: string[];
  sectors: string[];
  loading: boolean;
  error: string | null;
}

const initialState: TaxonomyState = {
  skills: [],
  sectors: [],
  loading: false,
  error: null,
};

export const fetchTaxonomy = createAsyncThunk(
  'taxonomy/fetch',
  async (_, { rejectWithValue }) => {
    try {
      // Fetch both endpoints in parallel
      const [skillsRes, sectorsRes] = await Promise.all([
        api.get('/skills/'),
        api.get('/sectors/')
      ]);
      
      // We assume the endpoints return an array of objects like { id: 1, name: 'Secteur A' }
      // Or they might be paginated { results: [...] }
      const skillsData = skillsRes.data.results || skillsRes.data;
      const sectorsData = sectorsRes.data.results || sectorsRes.data;
      
      return {
        skills: skillsData.map((item: any) => item.name).filter(Boolean),
        sectors: sectorsData.map((item: any) => item.name).filter(Boolean)
      };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || err.message || 'Erreur lors du chargement des nomenclatures');
    }
  }
);

export const taxonomySlice = createSlice({
  name: 'taxonomy',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTaxonomy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaxonomy.fulfilled, (state, action) => {
        state.loading = false;
        state.skills = action.payload.skills;
        state.sectors = action.payload.sectors;
      })
      .addCase(fetchTaxonomy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default taxonomySlice.reducer;
