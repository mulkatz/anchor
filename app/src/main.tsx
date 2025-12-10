import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './pages/App';
import './index.css';
import { initI18n } from './utils/i18n';
import { Toaster } from 'react-hot-toast';

// Initialize i18n before rendering
initI18n();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-center"
      containerStyle={{
        top: 'env(safe-area-inset-top, 0px)',
      }}
      toastOptions={{
        duration: 2500,
        style: {
          background: '#0A1128',
          color: '#E2E8F0',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
        },
      }}
      // Dismiss previous toasts when new one appears
      gutter={8}
    />
  </React.StrictMode>
);
