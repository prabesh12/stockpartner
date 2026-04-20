import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import customerService from '../services/customer.service';
import { CustomerLedgerDTO } from 'shared';
import { ArrowLeft, BookOpen, TrendingDown, TrendingUp } from 'lucide-react';

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
    <div className="p-8 max-w-5xl mx-auto w-full">
      <div className="mb-6">
        <Link to="/dashboard/customers" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft size={16} /> Back to Customers
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <BookOpen size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Passbook Ledger</h2>
           </div>
        </div>

        {error ? (
           <div className="p-6 text-red-500">{error}</div>
        ) : isLoading ? (
           <div className="p-12 text-center text-gray-500">Loading ledger history...</div>
        ) : ledgers.length === 0 ? (
           <div className="p-12 text-center text-gray-500">No transaction history found for this customer.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-xs uppercase text-gray-500 tracking-wider">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Type & Notes</th>
                  <th className="px-6 py-4 text-right">Debit (Udhar)</th>
                  <th className="px-6 py-4 text-right">Credit (Paid)</th>
                  <th className="px-6 py-4 text-right border-l border-gray-100 bg-gray-50 rounded-tr-lg">Running Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ledgers.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors text-sm">
                    <td className="px-6 py-4 font-mono text-gray-600">
                       {new Date(entry.createdAt).toLocaleDateString()}
                       <span className="block text-xs text-gray-400">{new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {entry.type === 'CREDIT' ? (
                          <span className="flex items-center gap-1 text-red-600 font-semibold"><TrendingUp size={16}/> Credit Sale</span>
                        ) : (
                          <span className="flex items-center gap-1 text-green-600 font-semibold"><TrendingDown size={16}/> Payment</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{entry.notes}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       {entry.type === 'CREDIT' ? <span className="font-semibold text-red-600">₹{Number(entry.amount).toFixed(2)}</span> : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                       {entry.type === 'PAYMENT' ? <span className="font-semibold text-green-600">₹{Number(entry.amount).toFixed(2)}</span> : '-'}
                    </td>
                    <td className="px-6 py-4 text-right border-l border-gray-100 bg-gray-50 font-bold text-gray-900">
                       ₹{Number(entry.balanceAfter).toFixed(2)}
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
