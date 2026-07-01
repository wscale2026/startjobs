import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
// Custom storage to fix Vite/ESM issues with redux-persist
const customStorage = {
  getItem: (key: string) => Promise.resolve(window.localStorage.getItem(key)),
  setItem: (key: string, value: string) => {
    window.localStorage.setItem(key, value);
    return Promise.resolve();
  },
  removeItem: (key: string) => {
    window.localStorage.removeItem(key);
    return Promise.resolve();
  },
};
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
import taxonomyReducer from './slices/taxonomySlice';

const persistConfig = {
  key: 'startjobs-root',
  storage: customStorage,
  whitelist: ['theme', 'auth', 'location', 'filters', 'locationsGlobal', 'siteSettings', 'offers', 'admin', 'messages', 'applications', 'taxonomy'],
};

const rootReducer = combineReducers({
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
  taxonomy: taxonomyReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
