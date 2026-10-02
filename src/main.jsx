import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { testSupabaseConnection } from './lib/connectionTest';
import './styles/index.css';

// Logs Supabase connection status to the console on startup (non-blocking).
testSupabaseConnection();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
