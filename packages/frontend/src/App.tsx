import { useEffect } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMe, logout } from '@/store/slices/authSlice';
import { RootState, AppDispatch } from '@/store';
import { syncOfflineSales } from '@/store/slices/posSlice';
import { Home, ShoppingBag, Package, Users, LogOut } from 'lucide-react';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { Products } from '@/pages/Products';
import { Customers } from '@/pages/Customers';
import { CustomerLedger } from '@/pages/CustomerLedger';
import { Dashboard } from '@/pages/Dashboard';
import { SuperAdminDashboard } from '@/pages/SuperAdminDashboard';
import { WorkspaceDetail } from '@/pages/WorkspaceDetail';
import { POS } from '@/pages/POS';
import { VerifyEmail } from '@/pages/VerifyEmail';
import { ForgotPassword } from '@/pages/ForgotPassword';
import { ResetPassword } from '@/pages/ResetPassword';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Marketplace } from '@/pages/Marketplace';
import { PublicProductDetail } from '@/pages/PublicProductDetail';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (token && !user) {
      dispatch(getMe());
    }
  }, [token, user, dispatch]);

  useEffect(() => {
    const handleOnline = () => {
      if (token) dispatch(syncOfflineSales());
    };
    window.addEventListener('online', handleOnline);
    if (navigator.onLine && token) dispatch(syncOfflineSales());
    return () => window.removeEventListener('online', handleOnline);
  }, [token, dispatch]);

  const handleLogout = () => dispatch(logout());

  const activeLink = "flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-white bg-emerald-600 font-semibold text-sm shadow-sm transition-all";
  const inactiveLink = "flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium text-sm transition-all";

  return (
    <Routes>
      <Route path="/" element={<Marketplace />} />
      <Route path="/product/:id" element={<PublicProductDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard/*" element={
          <div className="min-h-screen bg-slate-50 flex pb-20 md:pb-0">
            {/* Desktop Sidebar */}
            <aside className="w-60 bg-white border-r border-slate-200 hidden md:flex flex-col fixed h-screen top-0 left-0">
              <div className="p-5 border-b border-slate-100 flex items-center gap-2.5">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                  <ShoppingBag size={18} />
                </div>
                <h1 className="text-base font-bold text-slate-800">Stock<span className="text-emerald-600">Sathi</span></h1>
              </div>
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">{user?.shopName || 'My Shop'}</p>
              </div>
              <nav className="flex-1 p-3 space-y-0.5">
                <NavLink end to="/dashboard" className={({ isActive }) => isActive ? activeLink : inactiveLink}>
                  <Home size={16} />Dashboard
                </NavLink>
                <NavLink to="/dashboard/pos" className={({ isActive }) => isActive ? activeLink : inactiveLink}>
                  <ShoppingBag size={16} />Point of Sale
                </NavLink>
                <NavLink to="/dashboard/products" className={({ isActive }) => isActive ? activeLink : inactiveLink}>
                  <Package size={16} />Products
                </NavLink>
                <NavLink to="/dashboard/customers" className={({ isActive }) => isActive ? activeLink : inactiveLink}>
                  <Users size={16} />Customers & Credit
                </NavLink>
              </nav>
              <div className="p-3 border-t border-slate-100">
                <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-rose-50 hover:text-rose-600 font-medium text-sm transition-colors">
                  <LogOut size={16} />Sign Out
                </button>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-60 w-full relative pb-16 md:pb-0">
              {/* Mobile Header */}
              <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-[60] shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                    {user?.shopName?.charAt(0) || 'S'}
                  </div>
                  <span className="font-semibold text-slate-800 truncate max-w-[150px] text-sm">{user?.shopName || 'StockSathi'}</span>
                </div>
                <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                  <LogOut size={18} />
                </button>
              </header>

              <div className="w-full h-full overflow-x-hidden">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="pos" element={<POS />} />
                  <Route path="products" element={<Products />} />
                  <Route path="customers" element={<Customers />} />
                  <Route path="customers/:id/ledger" element={<CustomerLedger />} />
                </Routes>
              </div>
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 flex justify-around items-center px-2 py-2 z-[70] pb-safe shadow-[0_-1px_8px_rgba(0,0,0,0.06)]">
              <NavLink end to="/dashboard" className={({ isActive }) => `flex flex-col items-center gap-0.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                {({ isActive }) => <><div className={isActive ? 'bg-emerald-50 p-1.5 rounded-lg' : 'p-1.5'}><Home size={20} /></div><span className="text-[10px] font-semibold">Home</span></>}
              </NavLink>
              <NavLink to="/dashboard/pos" className={({ isActive }) => `flex flex-col items-center gap-0.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                {({ isActive }) => <><div className={isActive ? 'bg-emerald-50 p-1.5 rounded-lg' : 'p-1.5'}><ShoppingBag size={20} /></div><span className="text-[10px] font-semibold">POS</span></>}
              </NavLink>
              <NavLink to="/dashboard/products" className={({ isActive }) => `flex flex-col items-center gap-0.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                {({ isActive }) => <><div className={isActive ? 'bg-emerald-50 p-1.5 rounded-lg' : 'p-1.5'}><Package size={20} /></div><span className="text-[10px] font-semibold">Products</span></>}
              </NavLink>
              <NavLink to="/dashboard/customers" className={({ isActive }) => `flex flex-col items-center gap-0.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                {({ isActive }) => <><div className={isActive ? 'bg-emerald-50 p-1.5 rounded-lg' : 'p-1.5'}><Users size={20} /></div><span className="text-[10px] font-semibold">Customers</span></>}
              </NavLink>
            </nav>
          </div>
        } />

        {user && user.role === 'PLATFORM_ADMIN' && (
          <>
            <Route path="/superadmin" element={<SuperAdminDashboard />} />
            <Route path="/superadmin/workspace/:id" element={<WorkspaceDetail />} />
          </>
        )}
      </Route>
    </Routes>
  );
}

export default App;
