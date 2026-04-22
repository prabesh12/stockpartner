import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, handleInstallClick } = usePWAInstall();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show banner with a slight delay after it becomes installable
    if (isInstallable) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isInstallable]);

  const handleDismiss = () => {
    setIsVisible(false);
    // Optionally store dismissal in localStorage to avoid annoying the user
    localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
  };

  // Check if dismissed recently (within last 24 hours)
  useEffect(() => {
    const dismissedAt = localStorage.getItem('pwa-banner-dismissed');
    if (dismissedAt) {
      const oneDay = 24 * 60 * 60 * 1000;
      if (Date.now() - parseInt(dismissedAt) < oneDay) {
        setIsVisible(false);
      }
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[9999] md:left-auto md:right-8 md:w-96 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-2xl border border-indigo-100 dark:border-indigo-900/50">
        {/* Background Accent */}
        <div className="absolute -right-4 -top-4 h-24 w-24 bg-indigo-500/10 rounded-full blur-2xl" />
        <div className="absolute -left-4 -bottom-4 h-24 w-24 bg-purple-500/10 rounded-full blur-2xl" />
        
        <div className="relative flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none">
            <Download size={24} />
          </div>
          
          <div className="flex-1 pr-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              Install Stocksathi <Sparkles size={14} className="text-indigo-500" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Install our app for a faster, offline-ready experience and quick access from your home screen.
            </p>
            
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={handleInstallClick}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-all active:scale-95 shadow-sm shadow-indigo-200 dark:shadow-none"
              >
                Install Now
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 text-slate-500 dark:text-slate-400 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
          
          <button 
            onClick={handleDismiss}
            className="absolute top-0 right-0 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
