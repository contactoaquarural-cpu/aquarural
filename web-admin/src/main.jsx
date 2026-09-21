import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});

// El panel admin solo tiene tema claro — no se implementa modo oscuro.
// Se limpia cualquier clase "dark" que haya quedado en localStorage/DOM de
// una sesión anterior (cuando el toggle de tema todavía existía).
document.documentElement.classList.remove('dark');
document.documentElement.classList.add('light');
localStorage.removeItem('aquarural-theme');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
