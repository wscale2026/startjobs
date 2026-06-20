import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type Rayon = 1 | 3 | 5 | null;

interface FiltersState {
  query: string;
  domaine: string | null;
  typeProfil: string | null;
  disponible: boolean;
  rayon: Rayon;
}

const initialState: FiltersState = {
  query: '',
  domaine: null,
  typeProfil: null,
  disponible: false,
  rayon: null,
};

export const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => { state.query = action.payload; },
    setDomaine: (state, action: PayloadAction<string | null>) => { state.domaine = action.payload; },
    setTypeProfil: (state, action: PayloadAction<string | null>) => { state.typeProfil = action.payload; },
    toggleDisponible: (state) => { state.disponible = !state.disponible; },
    setRayon: (state, action: PayloadAction<Rayon>) => { state.rayon = action.payload; },
    resetFilters: () => initialState,
  },
});

export const { setQuery, setDomaine, setTypeProfil, toggleDisponible, setRayon, resetFilters } = filtersSlice.actions;
export default filtersSlice.reducer;
