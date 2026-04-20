import { AlertTriangle, RefreshCcw } from 'lucide-react';

export const GlobalErrorFallback = ({ error, resetErrorBoundary }: any) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full text-center border border-red-100">
        <div className="mx-auto w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
        <p className="text-gray-500 mb-6 text-sm">
          An unexpected error occurred in the application. Our team has been notified.
        </p>
        
        {import.meta.env.DEV && (
          <div className="bg-red-50 text-red-900 p-4 rounded-lg text-left overflow-auto text-xs w-full mb-6 font-mono border border-red-200">
             {error?.message}
          </div>
        )}

        <button
          onClick={resetErrorBoundary}
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition shadow-sm hover:shadow-md"
        >
          <RefreshCcw size={18} />
          Reload Application
        </button>
      </div>
    </div>
  );
};
