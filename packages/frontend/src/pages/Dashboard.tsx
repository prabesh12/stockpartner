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

  if (isLoading) return <div className="p-12 text-center text-gray-500 font-medium">Loading analytics...</div>;
  if (error) return <div className="p-8"><div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 font-medium">{error}</div></div>;
  if (!data) return null;

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm">Welcome back, {user?.name}. Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
             <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Today's Sales</p>
             <h3 className="text-2xl font-bold text-gray-900">{data.dailySalesCount}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><ShoppingBag size={24} /></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
             <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Today's Revenue</p>
             <h3 className="text-2xl font-bold text-gray-900">₹{data.dailyRevenue.toFixed(2)}</h3>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-xl"><DollarSign size={24} /></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
             <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Est. Profit (Today)</p>
             <h3 className="text-2xl font-bold text-gray-900">₹{data.dailyProfit.toFixed(2)}</h3>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><TrendingUp size={24} /></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
             <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">All-Time Revenue</p>
             <h3 className="text-2xl font-bold text-gray-900">₹{data.totalRevenue.toFixed(2)}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><DollarSign size={24} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="p-5 border-b border-gray-100 flex items-center gap-2">
             <TrendingUp size={20} className="text-blue-600"/>
             <h3 className="font-bold text-gray-900">Top Selling Products</h3>
          </div>
          <div className="p-0 flex-1 overflow-x-auto">
             {data.topSellingProducts.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">No sales data found.</div>
             ) : (
                <div className="min-w-max">
                  <table className="w-full text-left min-w-[500px]">
                  <thead>
                    <tr className="bg-gray-50/50 text-xs uppercase text-gray-500">
                      <th className="px-5 py-3 font-semibold">Product Name</th>
                      <th className="px-5 py-3 font-semibold text-right">Sold</th>
                      <th className="px-5 py-3 font-semibold text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.topSellingProducts.map(p => (
                      <tr key={p.productId} className="hover:bg-gray-50/50">
                        <td className="px-5 py-4 text-sm font-medium text-gray-900">{p.name}</td>
                        <td className="px-5 py-4 text-sm text-gray-600 text-right">{p.totalQuantitySold}</td>
                        <td className="px-5 py-4 text-sm font-semibold text-green-600 text-right">₹{p.revenueGenerated.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
             )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="p-5 border-b border-gray-100 flex items-center gap-2">
             <AlertTriangle size={20} className="text-red-500"/>
             <h3 className="font-bold text-gray-900">Low Stock Alerts</h3>
          </div>
          <div className="p-0 flex-1 overflow-x-auto overflow-y-auto max-h-80">
             {data.lowStockProducts.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">Inventory is healthy!</div>
             ) : (
                <div className="min-w-max">
                  <table className="w-full text-left min-w-[400px]">
                  <thead>
                    <tr className="bg-gray-50/50 text-xs uppercase text-gray-500">
                      <th className="px-5 py-3 font-semibold">Product</th>
                      <th className="px-5 py-3 font-semibold text-center">SKU</th>
                      <th className="px-5 py-3 font-semibold text-right">Current Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.lowStockProducts.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50/50">
                        <td className="px-5 py-4">
                           <div className="text-sm font-medium text-gray-900">{p.name}</div>
                        </td>
                        <td className="px-5 py-4 text-xs font-mono text-gray-500 text-center">{p.sku || p.barcode || '-'}</td>
                        <td className="px-5 py-4 text-right">
                           <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-bold bg-red-50 text-red-600">
                              <Package size={14}/> {p.currentStock.toFixed(2)}
                           </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
