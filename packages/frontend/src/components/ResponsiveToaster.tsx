import { useEffect, useState } from 'react';
import { Toaster, DefaultToastOptions } from 'react-hot-toast';

export const ResponsiveToaster = () => {
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    // Check if window is defined (for safety in SSR-like environments though this is standard React)
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(min-width: 768px)');
      setIsLargeScreen(mediaQuery.matches);

      const handler = (e: MediaQueryListEvent) => setIsLargeScreen(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, []);

  const toastOptions: DefaultToastOptions = {
    duration: 5000,
    style: {
      borderRadius: '8px',
      background: '#333',
      color: '#fff',
      fontSize: '14px',
      marginBottom: isLargeScreen ? '0px' : 'env(safe-area-inset-bottom, 20px)'
    },
  };

  return (
    <Toaster 
      position={isLargeScreen ? 'top-right' : 'bottom-center'}
      toastOptions={toastOptions}
    />
  );
};
