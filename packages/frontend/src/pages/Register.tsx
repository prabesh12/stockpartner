import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, clearError } from '@/store/slices/authSlice';
import { RootState, AppDispatch } from '@/store';
import { RegisterRequest } from 'shared';
import toast from 'react-hot-toast';
import { ShoppingBag, Plus, X, Mail, CheckCircle, MapPin, Loader2, Info } from 'lucide-react';
import { MapComponent } from '@/components/MapComponent';

export const Register = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterRequest>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const GENERIC_CATEGORIES = ['Fruits', 'Vegetables', 'Groceries', 'Hardware Items', 'Electronic Items', 'Apparel', 'Pharmacy', 'Stationery'];
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [customCategory, setCustomCategory] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Geolocation state
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'checking' | 'captured' | 'denied' | 'error'>('idle');
  const [locationMessage, setLocationMessage] = useState('');

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      setLocationMessage('Geolocation is not supported');
      return;
    }

    setLocationStatus('checking');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setLocation(coords);
        setLocationStatus('captured');
        setLocationMessage('Location captured successfully');
      },
      (err) => {
        if (err.code === 1) { // PERMISSION_DENIED
          setLocationStatus('denied');
          setLocationMessage('Location permission denied');
        } else {
          setLocationStatus('error');
          setLocationMessage('Unable to retrieve location');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

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
    if (isAuthenticated) navigate('/dashboard');
    return () => { dispatch(clearError()); };
  }, [isAuthenticated, navigate, dispatch]);

  const onSubmit = async (data: RegisterRequest) => {
    const payload = { 
      ...data, 
      categories: selectedCategories,
      latitude: location?.lat,
      longitude: location?.lng
    };
    try {
      await dispatch(registerUser(payload)).unwrap();
      setIsSuccess(true);
      toast.success("Shop registered successfully!");
    } catch (err: any) {
      const msg = typeof err === 'string' ? err : (err.message || "Failed to register shop");
      toast.error(msg);
    }
  };

  const inputClass = "w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors";

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <Mail className="w-10 h-10 text-emerald-600" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle size={18} className="text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-800">Check your email</h2>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            We've sent a verification link to your email address. Click the link to activate your account and start selling.
          </p>
          <Link
            to="/login"
            className="inline-block w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-sm"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 py-10">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-7 cursor-pointer" onClick={() => navigate('/')}>
        <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-sm">
          <ShoppingBag size={20} />
        </div>
        <span className="text-xl font-bold text-slate-800">Stock<span className="text-emerald-600">Sathi</span></span>
      </div>

      <div className="max-w-md w-full bg-white px-6 py-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Register Your Shop</h2>
          <p className="text-slate-500 text-sm mt-1">Set up your store and start managing inventory in minutes.</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Section 1: Account Information */}
          <div className="space-y-4">
             <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Account Credentials</h3>
             </div>
             
             <div>
               <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address (Login ID)</label>
               <input
                 {...register("email", { 
                    required: "Email is required for authentication",
                    pattern: {
                       value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                       message: "Invalid email format"
                    }
                 })}
                 type="email"
                 className={inputClass}
                 placeholder="owner@shop.com"
               />
               {errors.email && <span className="text-xs text-rose-500 mt-1 block">{errors.email.message}</span>}
             </div>

             <div>
               <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
               <input
                 {...register("password", { required: "Password is required" })}
                 type="password"
                 className={inputClass}
                 placeholder="••••••••"
               />
               {errors.password && <span className="text-xs text-rose-500 mt-1 block">{errors.password.message}</span>}
             </div>
          </div>

          {/* Section 2: Shop Details */}
          <div className="space-y-4 pt-2">
             <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Shop & Contact Details</h3>
             </div>

             <div>
               <label className="block text-sm font-semibold text-slate-700 mb-1.5">Shop Name</label>
               <input
                 {...register("shopName", { required: "Shop Name is required" })}
                 type="text"
                 className={inputClass}
                 placeholder="My Awesome Shop"
               />
               {errors.shopName && <span className="text-xs text-rose-500 mt-1 block">{errors.shopName.message}</span>}
             </div>

             <div>
               <label className="block text-sm font-semibold text-slate-700 mb-1.5">Owner Full Name</label>
               <input
                 {...register("userName", { required: "Owner name is required" })}
                 type="text"
                 className={inputClass}
                 placeholder="John Doe"
               />
               {errors.userName && <span className="text-xs text-rose-500 mt-1 block">{errors.userName.message}</span>}
             </div>

             <div>
               <label className="block text-sm font-semibold text-slate-700 mb-1.5">Contact Number (For Customers)</label>
               <input
                 {...register("phone", { 
                   required: "Contact number is required for customers to reach you",
                   pattern: {
                     value: /^[0-9+() -]{7,15}$/,
                     message: "Please enter a valid contact number"
                   }
                 })}
                 type="tel"
                 className={inputClass}
                 placeholder="+977 98XXXXXXXX"
               />
               <p className="text-[10px] text-slate-400 mt-1">This number will be displayed on your products for direct calls.</p>
               {errors.phone && <span className="text-xs text-rose-500 mt-1 block">{errors.phone.message}</span>}
             </div>

             <div>
               <label className="block text-sm font-semibold text-slate-700 mb-1.5">Physical Shop Address</label>
               <textarea
                 {...register("address", { required: "Physical address is required" })}
                 className={`${inputClass} min-h-[80px] resize-none`}
                 placeholder="City, Street, Landmark..."
               />
               {errors.address && <span className="text-xs text-rose-500 mt-1 block">{errors.address.message}</span>}
             </div>
          </div>

          {/* Location Status */}
          <div className="pt-2 space-y-3">
             <div className="flex items-center justify-between">
                <div>
                   <label className="block text-sm font-semibold text-slate-700">Shop Location</label>
                   <p className="text-[10px] text-slate-400 mt-0.5">Click on the map to set your exact location</p>
                </div>
                <button 
                   type="button"
                   onClick={requestLocation}
                   className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors"
                >
                   <MapPin size={14} /> 
                   {locationStatus === 'checking' ? 'Locating...' : 'Use GPS'}
                </button>
             </div>

             <div className="relative group">
                <MapComponent 
                   mode="picker"
                   location={location ? [location.lat, location.lng] : null}
                   onLocationSelect={(lat, lng) => {
                      setLocation({ lat, lng });
                      setLocationStatus('captured');
                      setLocationMessage('Location selected on map');
                   }}
                />
             </div>

             <div className={`flex items-center gap-2.5 p-3 rounded-xl border text-sm font-medium ${
               locationStatus === 'captured' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
               locationStatus === 'denied' ? 'bg-amber-50 text-amber-700 border-amber-100' :
               'bg-slate-50 text-slate-600 border-slate-100'
             }`}>
               {locationStatus === 'checking' && <Loader2 size={16} className="animate-spin text-slate-400" />}
               {locationStatus === 'captured' && <MapPin size={16} className="text-emerald-500" />}
               {(locationStatus === 'denied' || locationStatus === 'error') && (
                  <button type="button" onClick={requestLocation} className="hover:scale-110 transition-transform">
                     <Info size={16} className="text-amber-500" />
                  </button>
               )}
               
               <span className="flex-1 truncate">{locationMessage || 'Click the map or use GPS'}</span>
               
               {locationStatus === 'captured' && location && (
                 <span className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-emerald-200">
                   {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                 </span>
               )}
             </div>
          </div>


          {/* Categories */}
          <div className="pt-4 border-t border-slate-100">
            <div className="mb-3">
              <label className="block text-sm font-semibold text-slate-800">Shop Categories</label>
              <p className="text-xs text-slate-400 mt-0.5">Select the product types you sell</p>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              {GENERIC_CATEGORIES.map(cat => {
                const isSelected = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border ${
                      isSelected ? 'bg-emerald-600 border-emerald-600' : 'border-slate-300'
                    }`}>
                      {isSelected && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Custom categories added by user */}
            {selectedCategories.filter(c => !GENERIC_CATEGORIES.includes(c)).length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedCategories.filter(c => !GENERIC_CATEGORIES.includes(c)).map(cat => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 text-xs font-semibold rounded-lg border border-teal-200"
                  >
                    {cat}
                    <button type="button" onClick={() => toggleCategory(cat)} className="hover:text-teal-900">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Custom category input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomCategory(); } }}
                placeholder="Add custom category..."
                className="flex-1 px-3 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              />
              <button
                type="button"
                onClick={addCustomCategory}
                className="px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
              >
                <Plus size={16} />Add
              </button>
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
            {isLoading ? 'Registering...' : 'Create My Shop'}
          </button>

          <p className="text-sm text-center text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};
