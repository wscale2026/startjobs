import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LocationState {
  quartier: string;
  lat: number | null;
  lng: number | null;
  detected: boolean;
}

const initialState: LocationState = {
  quartier: 'Tous les quartiers',
  lat: 4.0511,
  lng: 9.7085,
  detected: false,
};

export const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setQuartier: (state, action: PayloadAction<string>) => {
      state.quartier = action.payload;
    },
    setCoords: (state, action: PayloadAction<{ lat: number; lng: number }>) => {
      state.lat = action.payload.lat;
      state.lng = action.payload.lng;
      state.detected = true;
    },
  },
});

export const { setQuartier, setCoords } = locationSlice.actions;
export default locationSlice.reducer;
