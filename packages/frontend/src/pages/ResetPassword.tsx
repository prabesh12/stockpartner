import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Loader2, CheckCircle, ArrowRight } from 'lucide-react';
import authService from '@/services/auth.service';
import toast from 'react-hot-toast';
import { ResetPasswordRequest } from 'shared';

export const ResetPassword = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<any>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
      const payload: ResetPasswordRequest = {
        token,
        newPassword: data.password
      };
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
           <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid Reset Link</h2>
           <p className="text-gray-500 mb-8">This link is invalid or expired. Please request a new one.</p>
           <Link to="/forgot-password" size="lg" className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all">
              Request New Link
           </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">New Password</h2>
          <p className="text-gray-500">Choose a strong password to secure your account.</p>
        </div>

        {isSuccess ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-600 w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Success!</h3>
            <p className="text-gray-600 mb-8">Your password has been reset successfully. You can now sign in with your new credentials.</p>
            <Link 
              to="/login"
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all font-bold"
            >
              Sign In Now <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  {...register("password", { 
                    required: "Password is required",
                    minLength: { value: 6, message: "At least 6 characters" }
                  })}
                  type="password"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-gray-50 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password.message as string}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  {...register("confirmPassword", { 
                    required: "Please confirm your password",
                    validate: (val: string) => {
                      if (watch('password') !== val) {
                        return "Passwords do not match";
                      }
                    },
                  })}
                  type="password"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-gray-50 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-medium">{errors.confirmPassword.message as string}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Updating password...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
