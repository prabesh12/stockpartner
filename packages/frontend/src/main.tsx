import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { ResponsiveToaster } from '@/components/ResponsiveToaster';
import { GlobalErrorFallback } from '@/components/GlobalErrorFallback';
import { store } from '@/store';
import App from '@/App';
import '@/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ErrorBoundary 
        FallbackComponent={GlobalErrorFallback}
        onReset={() => window.location.href = '/'}
      >
        <BrowserRouter>
          <App />
          <ResponsiveToaster />
        </BrowserRouter>
      </ErrorBoundary>
    </Provider>
  </StrictMode>,
);
