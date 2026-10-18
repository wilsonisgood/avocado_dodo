import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router';
import './styles/index.css';
import { queryClient } from './data/queries';
import { router } from './app/router';
import { PhoneFrame } from './app/PhoneFrame';
import { useApplyTheme } from './app/theme';

function App() {
  useApplyTheme();
  return (
    <PhoneFrame>
      <RouterProvider router={router} />
    </PhoneFrame>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
