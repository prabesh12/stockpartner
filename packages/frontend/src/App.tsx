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

  // Initialize session
  useEffect(() => {
    if (token && !user) {
      dispatch(getMe());
    }
  }, [token, user, dispatch]);

  useEffect(() => {
    const handleOnline = () => {
      if (token) {
        dispatch(syncOfflineSales());
      }
    };
    window.addEventListener('online', handleOnline);
    // Initial check on load
    if (navigator.onLine && token) {
      dispatch(syncOfflineSales());
    }
    return () => window.removeEventListener('online', handleOnline);
  }, [token, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <Routes>
      <Route path="/" element={<Marketplace />} />
      <Route path="/product/:id" element={<PublicProductDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard/*" element={
          <div className="min-h-screen bg-gray-50 flex pb-20 md:pb-0">
            {/* Desktop Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col fixed h-screen top-0 left-0">
               <div className="p-6 border-b border-gray-100 shadow-sm relative z-20">
                  <h1 className="text-xl font-bold text-gray-900">Inventory</h1>
               </div>
               <nav className="flex-1 p-4 space-y-1">
                  <NavLink end to="/dashboard" className={({isActive}) => isActive ? "block px-4 py-2 rounded-lg text-white hover:bg-indigo-700 bg-indigo-600 font-medium shadow-sm transition-colors" : "block px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition-colors"}>Dashboard</NavLink>
                  <NavLink to="/dashboard/pos" className={({isActive}) => isActive ? "block px-4 py-2 rounded-lg text-white hover:bg-indigo-700 bg-indigo-600 font-medium shadow-sm transition-colors" : "block px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition-colors"}>Point of Sale</NavLink>
                  <NavLink to="/dashboard/products" className={({isActive}) => isActive ? "block px-4 py-2 rounded-lg text-white hover:bg-indigo-700 bg-indigo-600 font-medium shadow-sm transition-colors" : "block px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition-colors"}>Products</NavLink>
                  <NavLink to="/dashboard/customers" className={({isActive}) => isActive ? "block px-4 py-2 rounded-lg text-white hover:bg-indigo-700 bg-indigo-600 font-medium shadow-sm transition-colors" : "block px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition-colors"}>Customers & Udhar</NavLink>
               </nav>
               <div className="p-4 border-t border-gray-100">
                   <button onClick={handleLogout} className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
                     Sign Out
                   </button>
               </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 md:ml-64 w-full relative pb-16 md:pb-0">
               {/* Mobile App Bar */}
               <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-[60] shadow-sm">
                  <div className="flex items-center gap-2">
                     <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                        {user?.shopName?.charAt(0) || 'S'}
                     </div>
                     <span className="font-bold text-gray-900 truncate max-w-[150px]">{user?.shopName || 'StockSathi'}</span>
                  </div>
                  <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2">
                     <LogOut size={18} />
                  </button>
               </header>

               <div className="w-full h-full overflow-x-hidden pt-4 md:pt-0">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="pos" element={<POS />} />
                    <Route path="products" element={<Products />} />
                    <Route path="customers" element={<Customers />} />
                    <Route path="customers/:id/ledger" element={<CustomerLedger />} />
                  </Routes>
               </div>
            </main>

            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around items-center px-2 py-3 z-[70] pb-safe shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.1)]">
               <NavLink end to="/dashboard" className={({isActive}) => `flex flex-col items-center gap-1 ${isActive ? "text-indigo-600" : "text-gray-500 hover:text-indigo-600"}`}>
                  {({isActive}) => <><div className={isActive ? "bg-indigo-50 p-1 rounded-md" : ""}><Home size={20} className={isActive ? "text-indigo-600" : ""} /></div><span className={`text-[10px] font-bold ${isActive ? "text-indigo-700" : ""}`}>Menu</span></>}
               </NavLink>
               <NavLink to="/dashboard/pos" className={({isActive}) => `flex flex-col items-center gap-1 ${isActive ? "text-indigo-600" : "text-gray-500 hover:text-indigo-600"}`}>
                  {({isActive}) => <><div className={isActive ? "bg-indigo-50 p-1 rounded-md" : ""}><ShoppingBag size={20} className={isActive ? "text-indigo-600" : ""} /></div><span className={`text-[10px] font-bold ${isActive ? "text-indigo-700" : ""}`}>POS</span></>}
               </NavLink>
               <NavLink to="/dashboard/products" className={({isActive}) => `flex flex-col items-center gap-1 ${isActive ? "text-indigo-600" : "text-gray-500 hover:text-indigo-600"}`}>
                  {({isActive}) => <><div className={isActive ? "bg-indigo-50 p-1 rounded-md" : ""}><Package size={20} className={isActive ? "text-indigo-600" : ""} /></div><span className={`text-[10px] font-bold ${isActive ? "text-indigo-700" : ""}`}>Products</span></>}
               </NavLink>
               <NavLink to="/dashboard/customers" className={({isActive}) => `flex flex-col items-center gap-1 ${isActive ? "text-indigo-600" : "text-gray-500 hover:text-indigo-600"}`}>
                  {({isActive}) => <><div className={isActive ? "bg-indigo-50 p-1 rounded-md" : ""}><Users size={20} className={isActive ? "text-indigo-600" : ""} /></div><span className={`text-[10px] font-bold ${isActive ? "text-indigo-700" : ""}`}>Customer</span></>}
               </NavLink>
            </nav>
          </div>
        } />
        
        {/* Isolated Super Admin Portal */}
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
