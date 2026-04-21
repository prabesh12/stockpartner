import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import authService from '@/services/auth.service';
import toast from 'react-hot-toast';

export const ForgotPassword = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState('');

  const onSubmit = async (data: { email: string }) => {
    setIsLoading(true);
    try {
      const res = await authService.forgotPassword(data);
      setIsSuccess(true);
      setMessage(res.message);
    } catch (err: any) {
      toast.error(typeof err === 'string' ? err : (err.message || 'Failed to send reset link'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="mb-7">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-600 transition-colors mb-6">
            <ArrowLeft size={16} />
            Back to Login
          </Link>
          <h2 className="text-2xl font-bold text-slate-800 mb-1.5">Forgot Password?</h2>
          <p className="text-slate-500 text-sm">Enter your email and we'll send you a reset link.</p>
        </div>

        {isSuccess ? (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-emerald-600" size={24} />
            </div>
            <p className="text-emerald-800 font-semibold mb-1.5">Check your email</p>
            <p className="text-emerald-600 text-sm">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email format" }
                  })}
                  type="email"
                  className="block w-full pl-11 pr-4 py-2.5 border border-slate-300 rounded-xl bg-white placeholder-slate-400 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="name@company.com"
                />
              </div>
              {errors.email && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.email.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isLoading ? (
                <><Loader2 className="animate-spin" size={18} />Sending...</>
              ) : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
