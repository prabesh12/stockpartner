import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { adminService } from '../services/admin.service';
import { logout } from '@/store/slices/authSlice';
import { Server, Store, Activity, UserPlus, Trash2, Edit2, Play, Plus, X, LogOut } from 'lucide-react';

interface Stats {
  totalShops: number;
  totalUsers: number;
  totalSales: number;
  platformRevenue: number;
}

interface Shop {
  id: string;
  name: string;
  createdAt: string;
  owner: { name: string; email: string; phone: string } | null;
  productCount: number;
  saleCount: number;
}

export const SuperAdminDashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search State Local Memory Filter
  const [searchQuery, setSearchQuery] = useState('');
  
  // UI States
  const [toast, setToast] = useState<{ message: string; visible: boolean } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [targetTenant, setTargetTenant] = useState<Shop | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isActionLoading, setIsActionLoading] = useState(false);

  const handleLogout = () => {
     dispatch(logout());
     navigate('/login');
  };

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsData, shopsData] = await Promise.all([
          adminService.getGlobalStats(),
          adminService.getAllShops()
        ]);
        setStats(statsData);
        setShops(shopsData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const triggerToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDisableRequest = (e: React.MouseEvent, shop: Shop) => {
    e.stopPropagation(); // Stop row click navigation
    setTargetTenant(shop);
    setModalOpen(true);
  };

  const confirmDisable = async () => {
    if (!targetTenant) return;
    setIsActionLoading(true);
    try {
      // Connect to the isolated API service layer stub!
      await adminService.suspendTenant(targetTenant.id);
      
      setModalOpen(false);
      triggerToast(`Tenant ${targetTenant.name} has been suspended via API Stub.`);
      
      // Optionally mock removing them from the list for UI realism:
      setShops(prev => prev.filter(s => s.id !== targetTenant.id));
    } catch (err: any) {
      triggerToast(`Failed to suspend: ${err.message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleImpersonate = async (e: React.MouseEvent, shop: Shop) => {
    e.stopPropagation();
    setIsActionLoading(true);
    try {
      await adminService.impersonateTenant(shop.id);
      triggerToast(`Connecting to ${shop.name} environment... (Stub)`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleInviteOwner = async (e: React.MouseEvent, shop: Shop) => {
    e.stopPropagation();
    setIsActionLoading(true);
    try {
      await adminService.inviteOwner(shop.id, 'mock@email.com');
      triggerToast(`Invitation dispatched to unassigned owner via API Stub.`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRowClick = (shopId: string) => {
    navigate(`/superadmin/workspace/${shopId}`);
  };

  const filteredShops = shops.filter(shop => 
    shop.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    shop.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-slate-50 pb-20">
       <nav className="bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
          <div className="w-48 h-6 bg-slate-800 animate-pulse rounded"></div>
       </nav>
       <main className="p-8 max-w-[1400px] mx-auto space-y-8 animate-pulse">
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 h-32"></div>)}
         </div>
         <div className="bg-white rounded-2xl border border-slate-200 h-64 mt-8"></div>
       </main>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20 relative">
      
       {/* UI Toast Overlay */}
       {toast && (
          <div className="fixed bottom-6 right-6 bg-slate-900 border border-slate-700 text-white px-5 py-3 rounded-lg shadow-xl font-medium text-sm z-50 animate-in fade-in slide-in-from-bottom-4">
             {toast.message}
          </div>
       )}

       {/* Confirmation Modal */}
       {modalOpen && targetTenant && (
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
             <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-4">
                   <div className="bg-red-100 p-3 rounded-full text-red-600">
                      <AlertTriangle size={24} className="lucide lucide-alert-triangle" />
                   </div>
                   <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Suspend Tenant Workspace</h3>
                <p className="text-slate-500 text-sm mb-6">Are you absolutely sure you want to deactivate <span className="font-bold text-slate-800">{targetTenant.name}</span>? They will immediately lose API access and their storefront will go offline.</p>
                <div className="flex gap-3 justify-end">
                   <button onClick={() => setModalOpen(false)} disabled={isActionLoading} className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                   <button onClick={confirmDisable} disabled={isActionLoading} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2">
                       <Trash2 size={16} /> {isActionLoading ? 'Suspending...' : 'Force Suspend'}
                   </button>
                </div>
             </div>
          </div>
       )}

       {/* Top Navigation */}
       <nav className="bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-3 font-bold text-lg tracking-tight">
             <Server className="text-blue-400" />
             SUPERADMIN <span className="opacity-40 font-normal">|</span> STOCKSATHI
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
             <div className="flex items-center gap-2 text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Server Operational
             </div>
             <button onClick={() => triggerToast('Create UI stub deployed.')} className="ml-2 flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 transition-colors text-white px-4 py-2 rounded-lg font-bold shadow-sm">
                <Plus size={16} /> New Workspace
             </button>
             <button onClick={handleLogout} className="ml-2 flex items-center gap-2 hover:bg-slate-800 transition-colors text-slate-300 hover:text-white px-3 py-2 rounded-lg font-semibold">
                <LogOut size={16} /> Logout
             </button>
          </div>
       </nav>

       <main className="p-8 max-w-[1400px] mx-auto space-y-8">
          {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 flex items-center gap-3"><AlertTriangle size={20} />{error}</div>}

          {/* Global Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group">
                  <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none"></div>
                  <p className="text-slate-500 text-xs font-bold tracking-wider uppercase mb-2">Total Tenants</p>
                  <h3 className="text-4xl font-black text-slate-900 flex items-center gap-3">
                     {stats.totalShops}
                  </h3>
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 w-max px-2 py-1 rounded-md">
                     <Activity size={12} /> +1 this week
                  </div>
               </div>
               
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <p className="text-slate-500 text-xs font-bold tracking-wider uppercase mb-2">Global Users</p>
                  <h3 className="text-4xl font-black text-slate-900 flex items-center gap-3">
                     {stats.totalUsers}
                  </h3>
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 w-max px-2 py-1 rounded-md">
                     <Activity size={12} /> +12% vs last month
                  </div>
               </div>

               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <p className="text-slate-500 text-xs font-bold tracking-wider uppercase mb-2">Platform Checkout Volume</p>
                  <h3 className="text-4xl font-black text-slate-900 flex items-center gap-3">
                     {stats.totalSales}
                  </h3>
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 w-max px-2 py-1 rounded-md">
                     <Activity size={12} /> +8% acceleration
                  </div>
               </div>

               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <p className="text-slate-500 text-xs font-bold tracking-wider uppercase mb-2">Total SaaS Revenue</p>
                  <h3 className="text-4xl font-black text-slate-900 flex items-center gap-3">
                     ₹{stats.platformRevenue.toFixed(2)}
                  </h3>
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 w-max px-2 py-1 rounded-md">
                     <Activity size={12} /> +24% growth
                  </div>
               </div>
            </div>
          )}

          {/* Tenant Grid Configuration Panel */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden mt-8">
             <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white text-slate-900 rounded-t-2xl relative">
                <h3 className="font-bold text-xl flex items-center gap-2">
                   <Store size={22} className="text-slate-400" /> Active Workspaces
                </h3>
                <input 
                   type="text" 
                   value={searchQuery}
                   onChange={e => setSearchQuery(e.target.value)}
                   placeholder="Search tenant IDs or names..." 
                   className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm w-72 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm"
                />
             </div>
             
             {shops.length === 0 ? (
                // Overhauled Empty State
                <div className="flex flex-col items-center justify-center p-16 text-center">
                   <div className="bg-slate-50 p-6 rounded-full mb-6 border border-slate-100 shadow-inner">
                      <Store size={48} className="text-slate-300" />
                   </div>
                   <h3 className="text-xl font-bold text-slate-900 mb-2">No physical workspaces detected.</h3>
                   <p className="text-slate-500 max-w-md mx-auto mb-8 font-medium">To kickstart your SaaS growth, begin by onboarding beta customers or generating your first testing workspace using the action panel.</p>
                   <button onClick={() => triggerToast('Wizard mock stub trigger.')} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md transition-all">
                      + Bootstrap First Tenant
                   </button>
                </div>
             ) : filteredShops.length === 0 && searchQuery !== '' ? (
                // Local Search Empty Fallback
                <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
                   <div className="bg-slate-100 p-4 rounded-full mb-4"><AlertTriangle size={32} className="text-slate-400" /></div>
                   <h3 className="text-lg font-bold text-slate-700">No results found for "{searchQuery}"</h3>
                   <button onClick={() => setSearchQuery('')} className="mt-4 text-indigo-600 hover:underline text-sm font-semibold">Clear Filters</button>
                </div>
             ) : (
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold tracking-widest uppercase text-slate-500">
                         <tr>
                            <th className="px-6 py-4">Workspace Root</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Administrative Owner</th>
                            <th className="px-6 py-4 text-center">Catalog</th>
                            <th className="px-6 py-4 text-center">Total Sales</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                         {filteredShops.map(shop => (
                            <tr 
                              key={shop.id} 
                              onClick={() => handleRowClick(shop.id)}
                              className="hover:bg-indigo-50/50 cursor-pointer group transition-colors"
                            >
                               <td className="px-6 py-5">
                                  <div className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors flex items-center gap-2">
                                     {shop.name}
                                  </div>
                                  <p className="text-xs font-mono text-slate-400 mt-1 opacity-60 group-hover:opacity-100">{shop.id}</p>
                               </td>
                               <td className="px-6 py-5">
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                                  </span>
                               </td>
                               <td className="px-6 py-5">
                                  {shop.owner ? (
                                     <div>
                                        <p className="text-sm font-bold text-slate-800">{shop.owner.name}</p>
                                        <p className="text-xs text-slate-500">{shop.owner.email || shop.owner.phone}</p>
                                     </div>
                                  ) : (
                                     <button 
                                       disabled={isActionLoading}
                                       onClick={(e) => handleInviteOwner(e, shop)}
                                       className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 font-bold text-xs rounded-md border border-indigo-200 hover:bg-indigo-100 transition-colors shadow-sm disabled:opacity-50"
                                     >
                                        <UserPlus size={14} /> {isActionLoading ? 'Sending...' : 'Invite Owner'}
                                     </button>
                                  )}
                               </td>
                               <td className="px-6 py-5 text-center">
                                  <span className="inline-block bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">{shop.productCount}</span>
                               </td>
                               <td className="px-6 py-5 text-center">
                                  <span className="inline-block bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">{shop.saleCount}</span>
                               </td>
                               <td className="px-6 py-5">
                                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                     <button disabled={isActionLoading} onClick={(e) => handleImpersonate(e, shop)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md disabled:opacity-50 border border-transparent hover:border-indigo-100">
                                        <Play size={14} className="fill-current opacity-70" /> Impersonate
                                     </button>
                                     <button disabled={isActionLoading} onClick={(e) => { e.stopPropagation(); triggerToast('Editing Configuration (Stub)...'); }} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md disabled:opacity-50 border border-transparent hover:border-blue-100">
                                        <Edit2 size={14} /> Edit
                                     </button>
                                     <button disabled={isActionLoading} onClick={(e) => handleDisableRequest(e, shop)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50 border border-transparent hover:border-red-100">
                                        <Trash2 size={14} /> Suspend
                                     </button>
                                  </div>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             )}
          </div>
       </main>
    </div>
  );
};
// Add AlertTriangle icon missing import 
import { AlertTriangle } from 'lucide-react';
