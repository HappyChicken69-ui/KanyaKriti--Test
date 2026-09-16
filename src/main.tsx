import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { LocationProvider } from './context/LocationContext.tsx';
import { LanguageProvider } from './context/LanguageContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LocationProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </LocationProvider>
  </StrictMode>,
);
