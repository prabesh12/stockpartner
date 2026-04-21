import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams, Link } from 'react-router-dom';
import { Lock, Loader2, CheckCircle, ArrowRight } from 'lucide-react';
import authService from '@/services/auth.service';
import toast from 'react-hot-toast';
import { ResetPasswordRequest } from 'shared';

export const ResetPassword = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<any>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const onSubmit = async (data: any) => {
    if (!token) {
      toast.error('Token is missing. Please use the link from your email.');
      return;
    }
    setIsLoading(true);
    try {
      const payload: ResetPasswordRequest = { token, newPassword: data.password };
      await authService.resetPassword(payload);
      setIsSuccess(true);
      toast.success('Password updated!');
    } catch (err: any) {
      toast.error(typeof err === 'string' ? err : (err.message || 'Failed to reset password'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Invalid Reset Link</h2>
          <p className="text-slate-500 text-sm mb-8">This link is invalid or expired. Please request a new one.</p>
          <Link to="/forgot-password" className="inline-block w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors">
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="mb-7">
          <h2 className="text-2xl font-bold text-slate-800 mb-1.5">New Password</h2>
          <p className="text-slate-500 text-sm">Choose a strong password to secure your account.</p>
        </div>

        {isSuccess ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="text-emerald-600 w-9 h-9" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Password Updated!</h3>
            <p className="text-slate-500 text-sm mb-7">You can now sign in with your new credentials.</p>
            <Link to="/login" className="w-full flex justify-center items-center gap-2 py-3 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">
              Sign In Now <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  {...register("password", { required: "Password is required", minLength: { value: 6, message: "At least 6 characters" } })}
                  type="password"
                  className="block w-full pl-11 pr-4 py-2.5 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.password.message as string}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (val: string) => watch('password') !== val ? "Passwords do not match" : true
                  })}
                  type="password"
                  className="block w-full pl-11 pr-4 py-2.5 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.confirmPassword.message as string}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isLoading ? <><Loader2 className="animate-spin" size={18} />Updating...</> : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
