import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import authService from '@/services/auth.service';

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token found. Please check your email link.');
      return;
    }

    const verify = async () => {
      try {
        const res = await authService.verifyEmail(token);
        setStatus('success');
        setMessage(res.message);
      } catch (err: any) {
        setStatus('error');
        setMessage(typeof err === 'string' ? err : (err.message || 'Verification failed'));
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">Verifying Email...</h2>
            <p className="text-gray-500 mt-2">Please wait while we confirm your account.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Email Verified!</h2>
            <p className="text-gray-600 mt-3 mb-8">{message}</p>
            <Link 
              to="/login"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-blue-200"
            >
              Back to Login
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Verification Failed</h2>
            <p className="text-red-500 mt-3 mb-8">{message}</p>
            <div className="flex flex-col gap-3 w-full">
              <Link 
                to="/register"
                className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg"
              >
                Try Registering Again
              </Link>
              <Link to="/login" className="text-blue-600 font-medium hover:underline">
                Go back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
