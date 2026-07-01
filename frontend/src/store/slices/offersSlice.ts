import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export interface ApiJobOffer {
  id: number;
  title: string;
  employer: any; // we can refine this later
  neighborhood: any;
  sector: any;
  description: string;
  start_date: string;
  duration: string;
  budget: string;
  is_urgent: boolean;
  contact_whatsapp: string;
  contact_phone: string;
  is_ad: boolean;
  is_active: boolean;
  created_at: string;
}

import type { JobOffer } from '../../mocks/offers';

interface OffersState {
  items: JobOffer[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: OffersState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchOffers = createAsyncThunk('offers/fetchOffers', async (params?: { my_offers?: boolean }) => {
  const queryParts = ['is_ad=false'];
  if (params?.my_offers) queryParts.push('my_offers=true');
  const response = await api.get(`offers/?${queryParts.join('&')}`);
  // Transform API response to match existing JobOffer interface
  return response.data.map((offer: any) => ({
    id: String(offer.id),
    titre: offer.title,
    employeur: offer.employer?.company_name || offer.employer?.user?.username || 'Inconnu',
    employeurUserId: offer.employer?.user?.id || null,
    quartier: offer.neighborhood?.name || 'Inconnu',
    distance: 1.5, // Dummy for now
    domaine: offer.sector?.name || 'Inconnu',
    description: offer.description,
    datePosted: new Date(offer.created_at).toLocaleDateString(),
    dateDebut: offer.start_date || 'Bientôt',
    duree: offer.duration || 'N/A',
    budget: offer.budget,
    urgent: offer.is_urgent,
    whatsapp: offer.contact_whatsapp || '',
    tel: offer.contact_phone || '',
    employeurVerifie: offer.employer?.verified || false,
    isAd: offer.is_ad
  }));
});

export const createOffer = createAsyncThunk('offers/createOffer', async (offerData: any) => {
  const response = await api.post('offers/', offerData);
  const offer = response.data;
  return {
    id: String(offer.id),
    titre: offer.title,
    employeur: offer.employer?.company_name || offer.employer?.user?.username || 'Inconnu',
    employeurUserId: offer.employer?.user?.id || null,
    quartier: offer.neighborhood?.name || 'Inconnu',
    distance: 1.5,
    domaine: offer.sector?.name || 'Inconnu',
    description: offer.description,
    datePosted: new Date(offer.created_at).toLocaleDateString(),
    dateDebut: offer.start_date || 'Bientôt',
    duree: offer.duration || 'N/A',
    budget: offer.budget,
    urgent: offer.is_urgent,
    whatsapp: offer.contact_whatsapp || '',
    tel: offer.contact_phone || '',
    employeurVerifie: offer.employer?.verified || false,
    isAd: offer.is_ad
  };
});

export const updateOffer = createAsyncThunk('offers/updateOffer', async ({ id, data }: { id: string | number, data: any }) => {
  const response = await api.put(`offers/${id}/`, data);
  const offer = response.data;
  return {
    id: String(offer.id),
    titre: offer.title,
    employeur: offer.employer?.company_name || offer.employer?.user?.username || 'Inconnu',
    employeurUserId: offer.employer?.user?.id || null,
    quartier: offer.neighborhood?.name || 'Inconnu',
    distance: 1.5,
    domaine: offer.sector?.name || 'Inconnu',
    description: offer.description,
    datePosted: new Date(offer.created_at).toLocaleDateString(),
    dateDebut: offer.start_date || 'Bientôt',
    duree: offer.duration || 'N/A',
    budget: offer.budget,
    urgent: offer.is_urgent,
    whatsapp: offer.contact_whatsapp || '',
    tel: offer.contact_phone || '',
    employeurVerifie: offer.employer?.verified || false,
    isAd: offer.is_ad
  };
});

export const deleteOffer = createAsyncThunk('offers/deleteOffer', async (id: number | string) => {
  await api.delete(`offers/${id}/`);
  return id;
});

const offersSlice = createSlice({
  name: 'offers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOffers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchOffers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchOffers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch offers';
      })
      .addCase(createOffer.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateOffer.pending, (state, action) => {
        const { id, data } = action.meta.arg;
        const index = state.items.findIndex(o => String(o.id) === String(id));
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...data };
        }
      })
      .addCase(updateOffer.fulfilled, (state, action) => {
        const index = state.items.findIndex(o => String(o.id) === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteOffer.pending, (state, action) => {
        state.items = state.items.filter((offer) => String(offer.id) !== String(action.meta.arg));
      })
      .addCase(deleteOffer.fulfilled, (state, action) => {
        state.items = state.items.filter((offer) => String(offer.id) !== String(action.payload));
      });
  },
});

export default offersSlice.reducer;
