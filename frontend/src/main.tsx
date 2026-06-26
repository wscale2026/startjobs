import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store, persistor } from './store';
import { PersistGate } from 'redux-persist/integration/react';
import { AppThemeProvider } from './theme/ThemeContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <AppThemeProvider>
        <PersistGate loading={null} persistor={persistor}>
          <App />
        </PersistGate>
      </AppThemeProvider>
    </Provider>
  </React.StrictMode>
);
