import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
// Initialize i18n (must come before App renders)
import './lib/i18n';
import App from './App.tsx';
import { initTheme } from './stores/themeStore';

// Apply persisted theme immediately, before first paint (avoids flash)
initTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
