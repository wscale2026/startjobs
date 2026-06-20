import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export interface LocationsGlobalState {
  locations: Record<string, string[]>;
}

const initialState: LocationsGlobalState = {
  locations: {
    'Douala': ['Akwa', 'Bonanjo', 'Bonapriso', 'Deido', 'Makepe', 'Bonamoussadi', 'Logpom', 'Kotto', 'Bali'],
    'Yaoundé': ['Bastos', 'Ngoa-Ekélé', 'Mokolo', 'Biyem-Assi', 'Omnisports']
  }
};

export const fetchLocations = createAsyncThunk('locationsGlobal/fetch', async () => {
  const res = await api.get('/neighborhoods/');
  const data = res.data.results || res.data;
  
  const fetchedLocations: Record<string, string[]> = {};
  data.forEach((item: { city: string, name: string }) => {
    if (!fetchedLocations[item.city]) {
      fetchedLocations[item.city] = [];
    }
    if (!fetchedLocations[item.city].includes(item.name)) {
      fetchedLocations[item.city].push(item.name);
    }
  });
  return fetchedLocations;
});

export const locationsGlobalSlice = createSlice({
  name: 'locationsGlobal',
  initialState,
  reducers: {
    addCity: (state, action: PayloadAction<string>) => {
      if (!state.locations[action.payload]) {
        state.locations[action.payload] = [];
      }
    },
    removeCity: (state, action: PayloadAction<string>) => {
      delete state.locations[action.payload];
    },
    addNeighborhood: (state, action: PayloadAction<{ city: string; neighborhood: string }>) => {
      const { city, neighborhood } = action.payload;
      if (state.locations[city] && !state.locations[city].includes(neighborhood)) {
        state.locations[city].push(neighborhood);
      }
    },
    removeNeighborhood: (state, action: PayloadAction<{ city: string; neighborhood: string }>) => {
      const { city, neighborhood } = action.payload;
      if (state.locations[city]) {
        state.locations[city] = state.locations[city].filter(n => n !== neighborhood);
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchLocations.fulfilled, (state, action) => {
      // Merge backend locations with initial locations, preserving any existing ones
      Object.keys(action.payload).forEach(city => {
        if (!state.locations[city]) {
          state.locations[city] = [];
        }
        action.payload[city].forEach(neighborhood => {
          if (!state.locations[city].includes(neighborhood)) {
            state.locations[city].push(neighborhood);
          }
        });
      });
    });
  }
});

export const { addCity, removeCity, addNeighborhood, removeNeighborhood } = locationsGlobalSlice.actions;
export default locationsGlobalSlice.reducer;
