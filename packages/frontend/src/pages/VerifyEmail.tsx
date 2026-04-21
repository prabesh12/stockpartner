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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-14 h-14 text-emerald-600 animate-spin" />
            <h2 className="text-xl font-bold text-slate-800">Verifying Email...</h2>
            <p className="text-slate-500 text-sm">Please wait while we confirm your account.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-2">
              <CheckCircle className="w-11 h-11 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Email Verified!</h2>
            <p className="text-slate-500 text-sm">{message}</p>
            <Link
              to="/login"
              className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-sm"
            >
              Continue to Login
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-2">
              <XCircle className="w-11 h-11 text-rose-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Verification Failed</h2>
            <p className="text-rose-500 text-sm">{message}</p>
            <div className="flex flex-col gap-2.5 w-full mt-4">
              <Link to="/register" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 px-6 rounded-xl transition-colors">
                Try Registering Again
              </Link>
              <Link to="/login" className="text-emerald-600 font-semibold text-sm hover:text-emerald-700 transition-colors">
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
