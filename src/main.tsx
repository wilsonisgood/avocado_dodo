import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router';
import './styles/index.css';
import { queryClient } from './data/queries';
import { router } from './app/router';
import { PhoneFrame } from './app/PhoneFrame';
import { useApplyTheme } from './app/theme';
import { useApplyLocale } from './app/locale';

function App() {
  const theme = useApplyTheme();
  const locale = useApplyLocale();
  // Re-mount on theme / language change: every asset path and every label is re-read.
  return (
    <PhoneFrame>
      <RouterProvider key={`${theme}-${locale}`} router={router} />
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
