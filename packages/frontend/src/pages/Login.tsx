import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, clearError } from '@/store/slices/authSlice';
import { RootState, AppDispatch } from '@/store';
import { LoginRequest } from 'shared';
import toast from 'react-hot-toast';

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
      toast.error(err.message || "Failed to sign in");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12 px-2 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white px-4 py-6 sm:p-8 rounded-xl shadow-md border border-gray-100">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                {...register("email", { required: "Email is required" })}
                type="email"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm mt-1"
                placeholder="owner@shop.com"
              />
              {errors.email && <span className="text-sm text-red-500">{errors.email.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                {...register("password", { required: "Password is required" })}
                type="password"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm mt-1"
                placeholder="••••••••"
              />
              {errors.password && <span className="text-sm text-red-500">{errors.password.message}</span>}
            </div>
          </div>

          {error && <div className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded">{error}</div>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          
          <div className="text-sm text-center">
             <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
               Don't have an account? Register your shop
             </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
