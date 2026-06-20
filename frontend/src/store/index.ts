import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import themeReducer from './slices/themeSlice';
import locationReducer from './slices/locationSlice';
import filtersReducer from './slices/filtersSlice';
import wizardReducer from './slices/wizardSlice';
import snackbarReducer from './slices/snackbarSlice';
import authReducer from './slices/authSlice';
import adminReducer from './slices/adminSlice';
import locationsGlobalReducer from './slices/locationsGlobalSlice';
import offersReducer from './slices/offersSlice';
import applicationsReducer from './slices/applicationsSlice';
import messagesReducer from './slices/messagesSlice';
import siteSettingsReducer from './slices/siteSettingsSlice';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    location: locationReducer,
    filters: filtersReducer,
    wizard: wizardReducer,
    snackbar: snackbarReducer,
    auth: authReducer,
    admin: adminReducer,
    locationsGlobal: locationsGlobalReducer,
    offers: offersReducer,
    applications: applicationsReducer,
    messages: messagesReducer,
    siteSettings: siteSettingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
