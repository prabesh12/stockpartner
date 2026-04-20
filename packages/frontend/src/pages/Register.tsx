import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, clearError } from '@/store/slices/authSlice';
import { RootState, AppDispatch } from '@/store';
import { RegisterRequest } from 'shared';
import toast from 'react-hot-toast';

export const Register = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterRequest>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const GENERIC_CATEGORIES = ['Fruits', 'Vegetables', 'Groceries', 'Hardware Items', 'Electronic Items', 'Apparel', 'Pharmacy', 'Stationery'];
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [customCategory, setCustomCategory] = useState('');

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const addCustomCategory = () => {
    const sanitized = customCategory.trim();
    if (sanitized && !selectedCategories.includes(sanitized)) {
      setSelectedCategories(prev => [...prev, sanitized]);
      setCustomCategory('');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    return () => { dispatch(clearError()); };
  }, [isAuthenticated, navigate, dispatch]);

  const onSubmit = async (data: RegisterRequest) => {
    const payload = { ...data, categories: selectedCategories };
    try {
      await dispatch(registerUser(payload)).unwrap();
      toast.success("Shop registered successfully!");
    } catch (err: any) {
      const msg = typeof err === 'string' ? err : (err.message || "Failed to register shop");
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12 px-2 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white px-4 py-6 sm:p-8 rounded-xl shadow-md border border-gray-100">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">Register Your Shop</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Shop Name</label>
              <input
                {...register("shopName", { required: "Shop Name is required" })}
                type="text"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm mt-1"
                placeholder="My Awesome Shop"
              />
              {errors.shopName && <span className="text-sm text-red-500">{errors.shopName.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Your Name (Owner)</label>
              <input
                {...register("userName", { required: "Your name is required" })}
                type="text"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm mt-1"
                placeholder="John Doe"
              />
              {errors.userName && <span className="text-sm text-red-500">{errors.userName.message}</span>}
            </div>
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
            
            <div className="pt-4 border-t border-gray-100">
              <label className="block text-sm font-bold text-gray-800 mb-3">Shop Categories <span className="text-gray-400 font-normal text-xs">(Taxonomy)</span></label>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {GENERIC_CATEGORIES.map(cat => (
                  <label key={cat} className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                    <input 
                      type="checkbox" 
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                    />
                    <span>{cat}</span>
                  </label>
                ))}
                {selectedCategories.filter(c => !GENERIC_CATEGORIES.includes(c)).map(cat => (
                  <label key={cat} className="flex items-center space-x-2 text-sm text-blue-700 font-medium cursor-pointer p-2 bg-blue-50 hover:bg-blue-100 rounded-lg">
                    <input 
                      type="checkbox" 
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                      checked={true}
                      onChange={() => toggleCategory(cat)}
                    />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); addCustomCategory(); } }}
                  placeholder="Type custom category..."
                  className="flex-1 appearance-none rounded-md px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <button type="button" onClick={addCustomCategory} className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors">
                  Add
                </button>
              </div>
            </div>
          </div>

          {error && <div className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded">{error}</div>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isLoading ? 'Registering...' : 'Complete Registration'}
            </button>
          </div>
          
          <div className="text-sm text-center">
             <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
               Already have an account? Sign in
             </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
