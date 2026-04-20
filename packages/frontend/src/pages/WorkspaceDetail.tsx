import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Store, Users, ShoppingBag, TrendingUp, AlertTriangle } from 'lucide-react';

export const WorkspaceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // States for UX
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; visible: boolean } | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const triggerToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast(null), 3000);
  };

  const confirmDisable = async () => {
    setIsActionLoading(true);
    try {
      // Stub integration mapping
      await new Promise(r => setTimeout(r, 600));
      setModalOpen(false);
      triggerToast(`Workspace has been suspended via API Stub.`);
    } finally {
      setIsActionLoading(false);
    }
  };

  // MOCK DATA for now until backend is written:
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
         <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center shadow-sm animate-pulse">
             <div className="w-8 h-8 bg-slate-200 rounded-lg mr-4"></div>
             <div className="w-48 h-6 bg-slate-200 rounded"></div>
             <div className="ml-auto w-32 h-10 bg-slate-200 rounded-lg"></div>
         </nav>
         <main className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {[1, 2, 3].map(i => (
                 <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-pulse">
                    <div className="w-32 h-4 bg-slate-100 mb-4 rounded"></div>
                    <div className="w-16 h-8 bg-slate-200 rounded"></div>
                 </div>
               ))}
            </div>
         </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

       {/* Toast Overlay */}
       {toast && (
          <div className="fixed bottom-6 right-6 bg-slate-900 border border-slate-700 text-white px-5 py-3 rounded-lg shadow-xl font-medium text-sm z-50 animate-in fade-in slide-in-from-bottom-4">
             {toast.message}
          </div>
       )}

       {/* Confirmation Modal */}
       {modalOpen && (
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
             <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-4">
                   <div className="bg-red-100 p-3 rounded-full text-red-600">
                      <AlertTriangle size={24} />
                   </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Suspend Tenant Workspace</h3>
                <p className="text-slate-500 text-sm mb-6">This will immediately disable all access for this workspace.</p>
                <div className="flex gap-3 justify-end">
                   <button onClick={() => setModalOpen(false)} disabled={isActionLoading} className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                   <button onClick={confirmDisable} disabled={isActionLoading} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-sm">
                       {isActionLoading ? 'Suspending...' : 'Force Suspend'}
                   </button>
                </div>
             </div>
          </div>
       )}

       <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
          <button 
             onClick={() => navigate('/superadmin')}
             className="px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm"
          >
             <ArrowLeft size={18} /> ← Back to Workspaces
          </button>
          <div className="flex items-center gap-3">
             <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600"><Store size={20} /></div>
             <div>
                <h1 className="font-bold text-slate-900 leading-tight">Workspace Data Profile</h1>
                <p className="text-xs font-mono text-slate-500">ID: {id}</p>
             </div>
          </div>
          <div className="ml-auto flex gap-3">
             <button onClick={() => triggerToast('Impersonating tenant...')} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50">
               Impersonate Tenant
             </button>
             <button onClick={() => setModalOpen(true)} className="px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100">
               Suspend Workspace
             </button>
          </div>
       </nav>

       <main className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-6">
          <div className="text-slate-500 text-sm flex gap-2 items-center italic mb-4">
             <AlertTriangle size={16} className="text-slate-400" />
             This is a structural mock screen for the future tenant drill-down functionality.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-2"><Users size={16}/> Active Staff Users</h3>
                <p className="text-3xl font-black text-slate-900 mt-2">4</p>
             </div>
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-2"><ShoppingBag size={16}/> Active Products</h3>
                <p className="text-3xl font-black text-slate-900 mt-2">128</p>
             </div>
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-2"><TrendingUp size={16}/> MRR Contribution</h3>
                <p className="text-3xl font-black text-slate-900 mt-2">₹1,400.00</p>
             </div>
          </div>
       </main>
    </div>
  );
};
