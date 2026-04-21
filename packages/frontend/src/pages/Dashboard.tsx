import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { DashboardSummaryDTO } from 'shared';
import { fetchDashboardSummary } from '@/services/dashboard.service';
import { TrendingUp, ShoppingBag, DollarSign, AlertTriangle, Package } from 'lucide-react';

export const Dashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [data, setData] = useState<DashboardSummaryDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const metrics = await fetchDashboardSummary();
        setData(metrics);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (isLoading) return (
    <div className="p-8 flex items-center justify-center min-h-[300px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-[3px] border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-sm font-medium">Loading analytics...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="p-8">
      <div className="bg-rose-50 text-rose-600 p-4 rounded-xl border border-rose-100 font-medium text-sm">{error}</div>
    </div>
  );

  if (!data) return null;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">Welcome back, {user?.name}. Here's today's snapshot.</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Today's Sales</p>
            <h3 className="text-2xl font-bold text-slate-800">{data.dailySalesCount}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><ShoppingBag size={22} /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Today's Revenue</p>
            <h3 className="text-2xl font-bold text-slate-800">₹{data.dailyRevenue.toFixed(2)}</h3>
          </div>
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl"><DollarSign size={22} /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Est. Profit</p>
            <h3 className="text-2xl font-bold text-slate-800">₹{data.dailyProfit.toFixed(2)}</h3>
          </div>
          <div className="p-3 bg-violet-50 text-violet-600 rounded-xl"><TrendingUp size={22} /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">All-Time Revenue</p>
            <h3 className="text-2xl font-bold text-slate-800">₹{data.totalRevenue.toFixed(2)}</h3>
          </div>
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl"><DollarSign size={22} /></div>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling */}
        <div className="bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-sm">Top Selling Products</h3>
          </div>
          <div className="flex-1 overflow-x-auto">
            {data.topSellingProducts.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No sales data yet.</div>
            ) : (
              <table className="w-full text-left min-w-[400px]">
                <thead>
                  <tr className="bg-slate-50 text-xs uppercase text-slate-400">
                    <th className="px-5 py-3 font-semibold">Product</th>
                    <th className="px-5 py-3 font-semibold text-right">Sold</th>
                    <th className="px-5 py-3 font-semibold text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.topSellingProducts.map(p => (
                    <tr key={p.productId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-medium text-slate-800">{p.name}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-500 text-right">{p.totalQuantitySold}</td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-emerald-600 text-right">₹{p.revenueGenerated.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" />
            <h3 className="font-bold text-slate-800 text-sm">Low Stock Alerts</h3>
          </div>
          <div className="flex-1 overflow-x-auto overflow-y-auto max-h-72">
            {data.lowStockProducts.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">Inventory is healthy! ✓</div>
            ) : (
              <table className="w-full text-left min-w-[360px]">
                <thead>
                  <tr className="bg-slate-50 text-xs uppercase text-slate-400">
                    <th className="px-5 py-3 font-semibold">Product</th>
                    <th className="px-5 py-3 font-semibold text-center">SKU</th>
                    <th className="px-5 py-3 font-semibold text-right">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.lowStockProducts.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-medium text-slate-800">{p.name}</td>
                      <td className="px-5 py-3.5 text-xs font-mono text-slate-400 text-center">{p.sku || p.barcode || '-'}</td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-600">
                          <Package size={12} /> {p.currentStock.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
