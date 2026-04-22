import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, clearError } from '@/store/slices/authSlice';
import { RootState, AppDispatch } from '@/store';
import { LoginRequest } from 'shared';
import toast from 'react-hot-toast';
import { ShoppingBag } from 'lucide-react';

export const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginRequest>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'PLATFORM_ADMIN') {
        navigate('/superadmin');
      } else {
        navigate('/dashboard');
      }
    }
    return () => { dispatch(clearError()); };
  }, [isAuthenticated, user, navigate, dispatch]);

  const onSubmit = async (data: LoginRequest) => {
    try {
      await dispatch(loginUser(data)).unwrap();
      toast.success("Welcome back!");
    } catch (err: any) {
      const msg = typeof err === 'string' ? err : (err.message || "Failed to sign in");
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-8 cursor-pointer" onClick={() => navigate('/')}>
        <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-sm">
          <ShoppingBag size={20} />
        </div>
        <span className="text-xl font-bold text-slate-800">Stock<span className="text-emerald-600">Sathi</span></span>
      </div>

      <div className="max-w-md w-full bg-white px-4 sm:px-6 py-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Welcome back</h2>
          <p className="text-slate-500 text-sm mt-1">Sign in to your shop dashboard</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <input
                {...register("email", { required: "Email is required" })}
                type="email"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                placeholder="owner@shop.com"
              />
              {errors.email && <span className="text-xs text-rose-500 mt-1">{errors.email.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <input
                {...register("password", { required: "Password is required" })}
                type="password"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                placeholder="••••••••"
              />
              <div className="flex justify-end mt-1.5">
                <Link to="/forgot-password" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                  Forgot password?
                </Link>
              </div>
              {errors.password && <span className="text-xs text-rose-500">{errors.password.message}</span>}
            </div>
          </div>

          {error && (
            <div className="text-rose-600 text-sm text-center font-medium bg-rose-50 p-3 rounded-xl border border-rose-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="text-sm text-center text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-700">
              Register your shop
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};
