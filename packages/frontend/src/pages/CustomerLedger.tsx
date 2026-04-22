import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import customerService from '../services/customer.service';
import { CustomerLedgerDTO, CustomerDTO } from 'shared';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Wallet,
  Download,
  CreditCard,
  Banknote,
  Smartphone,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';

const fmt = (val: number | string | undefined) => {
  const n = Number(val) || 0;
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Math.abs(n));
  
  const indicator = n >= 0 ? 'Dr' : 'Cr';
  return `₹ ${formatted} ${indicator}`;
};

const rawFmt = (val: number | string | undefined) => {
  const n = Number(val) || 0;
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Math.abs(n));
};

export const CustomerLedger = () => {
  const { id } = useParams<{ id: string }>();
  const [ledgers, setLedgers] = useState<CustomerLedgerDTO[]>([]);
  const [customer, setCustomer] = useState<CustomerDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const [ledgerData, customerData] = await Promise.all([
          customerService.getLedger(id),
          customerService.getCustomer(id)
        ]);
        setLedgers(ledgerData);
        setCustomer(customerData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const stats = useMemo(() => {
    if (!ledgers.length) return { debit: 0, credit: 0 };
    return ledgers.reduce((acc, curr) => {
      if (curr.type === 'CREDIT') acc.debit += Number(curr.amount);
      else acc.credit += Number(curr.amount);
      return acc;
    }, { debit: 0, credit: 0 });
  }, [ledgers]);

  const getModeIcon = (mode: string | null) => {
    if (!mode) return null;
    switch (mode.toUpperCase()) {
      case 'CASH': return <Banknote size={14} className="text-emerald-600" />;
      case 'UPI': return <Smartphone size={14} className="text-emerald-600" />;
      case 'CARD': return <CreditCard size={14} className="text-emerald-600" />;
      default: return <Wallet size={14} className="text-emerald-600" />;
    }
  };

  if (isLoading) return (
    <div className="p-12 text-center h-[80vh] flex flex-col items-center justify-center bg-white">
      <div className="w-12 h-12 border-[3px] border-emerald-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 font-medium">Preparing Statement...</p>
    </div>
  );

  if (error || !customer) return (
    <div className="p-6 text-center bg-white h-screen">
      <div className="bg-rose-50 text-rose-600 p-5 rounded-2xl border border-rose-100 max-w-md mx-auto">
        {error || 'Customer record not found'}
      </div>
      <Link to="/dashboard/customers" className="mt-6 inline-flex items-center gap-2 text-emerald-600 font-bold">
        <ArrowLeft size={16} /> Back to Customers
      </Link>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      {/* Top Breadcrumb & Actions */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
          <Link to="/dashboard/customers" className="hover:text-emerald-600 transition-colors">Customers</Link>
          <ChevronRight size={14} />
          <span className="text-slate-800 font-bold">Account Ledger</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm">
            <Download size={14} /> Download PDF
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
        {/* Main Header Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left: Customer Identity */}
            <div className="lg:col-span-4 p-8 lg:border-r border-slate-100 bg-slate-50/30">
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <User size={32} />
                </div>
                <div className="overflow-hidden">
                  <h1 className="text-2xl font-black text-slate-800 leading-tight truncate">{customer.name}</h1>
                  <p className="text-xs font-bold text-emerald-600 mt-1 uppercase tracking-widest">ID: CUST-{customer.id.slice(0, 4)}</p>
                </div>
              </div>
              
              <div className="mt-8 space-y-4">
                <InfoItem icon={<Phone size={14} />} label="Phone" value={customer.phone} />
                <InfoItem icon={<Mail size={14} />} label="Email" value={customer.email || 'No email provided'} />
                <InfoItem icon={<MapPin size={14} />} label="Address" value={customer.address || 'No address added'} />
              </div>
            </div>

            {/* Right: Summary Figures */}
            <div className="lg:col-span-8 p-8 flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Account Overview</h3>
                  <p className="text-xs text-slate-400 mt-1">Generated on {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-100">
                  <Calendar size={14} /> All Time Statement
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                <MiniStat label="Opening" value={customer.openingBalance} />
                <MiniStat label="Total Sales" value={stats.debit} isDebit />
                <MiniStat label="Payments" value={stats.credit} isCredit />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Final Balance</span>
                  <span className={`text-xl font-bold tabular-nums whitespace-nowrap ${Number(customer.totalDue) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {fmt(customer.totalDue)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Table Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <div className="w-2 h-6 bg-emerald-500 rounded-full"></div>
              Transaction History
            </h2>
          </div>
          
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-r border-slate-100/50">Date</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-r border-slate-100/50">Voucher No</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-r border-slate-100/50">Details & Mode</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right border-r border-slate-100/50">Debit (Sales)</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right border-r border-slate-100/50">Credit (Paid)</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-800 text-right">Running Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ledgers.slice().reverse().map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50 transition-colors group even:bg-slate-50/50">
                      <td className="px-6 py-5 whitespace-nowrap border-r border-slate-100/50">
                        <p className="text-xs font-bold text-slate-700">{new Date(entry.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </td>
                      <td className="px-6 py-5 border-r border-slate-100/50">
                        <span className={`inline-block px-2 py-1 rounded-lg text-[10px] font-black border ${
                          entry.voucherNo?.startsWith('INV') ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          entry.voucherNo?.startsWith('RCT') ? 'bg-slate-50 text-slate-600 border-slate-200' :
                          'bg-slate-50 text-slate-400 border-slate-100'
                        }`}>
                          {entry.voucherNo || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-5 border-r border-slate-100/50">
                        <div className="text-xs font-bold text-slate-700 leading-tight">{entry.notes}</div>
                        <div className="flex items-center gap-1.5 mt-1">
                          {getModeIcon(entry.paymentMethod)}
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{entry.paymentMethod || 'Non-Cash'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right font-medium text-slate-800 text-sm border-r border-slate-100/50">
                        {entry.type === 'CREDIT' ? `₹ ${rawFmt(entry.amount)}` : <span className="text-slate-200">—</span>}
                      </td>
                      <td className="px-6 py-5 text-right font-medium text-slate-800 text-sm border-r border-slate-100/50">
                        {entry.type === 'PAYMENT' ? `₹ ${rawFmt(entry.amount)}` : <span className="text-slate-200">—</span>}
                      </td>
                      <td className="px-6 py-5 text-right whitespace-nowrap bg-slate-50/30">
                        <span className={`text-sm font-semibold tabular-nums ${Number(entry.balanceAfter) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {fmt(entry.balanceAfter)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50/50">
                  <tr>
                    <td colSpan={3} className="px-6 py-6 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Movements</td>
                    <td className="px-6 py-6 text-right font-bold text-slate-800 text-base border-t-2 border-emerald-500/20">₹ {rawFmt(stats.debit)}</td>
                    <td className="px-6 py-6 text-right font-bold text-slate-800 text-base border-t-2 border-emerald-500/20">₹ {rawFmt(stats.credit)}</td>
                    <td className="px-6 py-6 text-right font-bold text-emerald-700 text-lg border-t-2 border-emerald-500 whitespace-nowrap">{fmt(customer.totalDue)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ icon, label, value }: { icon: any, label: string, value: string }) => (
  <div className="flex items-start gap-4">
    <div className="mt-0.5 text-emerald-600 flex-shrink-0">{icon}</div>
    <div className="overflow-hidden">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
      <p className="text-xs font-bold text-slate-700 leading-tight">{value}</p>
    </div>
  </div>
);

const MiniStat = ({ label, value, isDebit, isCredit }: { label: string, value: any, isDebit?: boolean, isCredit?: boolean }) => (
  <div className="flex flex-col">
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
      {label}
      {isDebit && <ArrowUpRight size={10} className="text-emerald-500" />}
      {isCredit && <ArrowDownLeft size={10} className="text-emerald-500" />}
    </span>
    <span className="text-base font-bold text-slate-800 tabular-nums">
      ₹ {rawFmt(value)}
    </span>
  </div>
);
