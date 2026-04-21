import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import customerService from '../services/customer.service';
import { CustomerLedgerDTO } from 'shared';
import { ArrowLeft, BookOpen, TrendingDown, TrendingUp } from 'lucide-react';

// Format currency with sign BEFORE the ₹ symbol: -₹179.00 instead of ₹-179.00
const fmt = (val: number | string) => {
  const n = Number(val);
  const abs = `₹${Math.abs(n).toFixed(2)}`;
  return n < 0 ? `-${abs}` : abs;
};

export const CustomerLedger = () => {
  const { id } = useParams<{ id: string }>();
  const [ledgers, setLedgers] = useState<CustomerLedgerDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchLedgers = async () => {
      try {
        const data = await customerService.getLedger(id);
        setLedgers(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLedgers();
  }, [id]);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto w-full space-y-4">
      <Link to="/dashboard/customers" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-600 transition-colors">
        <ArrowLeft size={16} />Back to Customers
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <BookOpen size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Passbook Ledger</h2>
            <p className="text-xs text-slate-400">Full transaction & payment history</p>
          </div>
        </div>

        {error ? (
          <div className="p-6 text-rose-500 text-sm font-medium bg-rose-50">{error}</div>
        ) : isLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-[3px] border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-slate-500 text-sm">Loading ledger history...</p>
          </div>
        ) : ledgers.length === 0 ? (
          <div className="p-16 text-center text-slate-500 text-sm">No transaction history found for this customer.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type & Notes</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Debit (Credit)</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Credit (Paid)</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right bg-slate-100">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {ledgers.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/60 transition-colors text-sm">
                    <td className="px-5 py-4 font-mono text-slate-600 text-xs">
                      {new Date(entry.createdAt).toLocaleDateString()}
                      <span className="block text-slate-400">{new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        {entry.type === 'CREDIT' ? (
                          <span className="inline-flex items-center gap-1.5 text-rose-600 font-semibold text-xs bg-rose-50 px-2 py-1 rounded-lg">
                            <TrendingUp size={13} />Credit Sale
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold text-xs bg-emerald-50 px-2 py-1 rounded-lg">
                            <TrendingDown size={13} />Payment
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-1.5">{entry.notes}</div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {entry.type === 'CREDIT' ? <span className="font-semibold text-rose-600">{fmt(entry.amount)}</span> : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {entry.type === 'PAYMENT' ? <span className="font-semibold text-emerald-600">{fmt(entry.amount)}</span> : <span className="text-slate-300">—</span>}
                    </td>
                    <td className={`px-5 py-4 text-right bg-slate-50 font-bold ${Number(entry.balanceAfter) < 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                      {fmt(entry.balanceAfter)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
