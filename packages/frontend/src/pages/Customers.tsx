import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '@/store';
import { fetchCustomers, addCustomer, editCustomer, processPayment, clearCustomerError } from '@/store/slices/customerSlice';
import { CustomerDTO } from 'shared';
import { CustomerForm } from '@/components/CustomerForm';
import { PaymentForm } from '@/components/PaymentForm';
import { Users, Edit2, Wallet, FileText, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export const Customers = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items, isLoading, error } = useSelector((state: RootState) => state.customers);

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activeCustomer, setActiveCustomer] = useState<CustomerDTO | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => { dispatch(fetchCustomers()); }, [dispatch]);

  const handleOpenCustomerModal = (customer?: CustomerDTO) => {
    setActiveCustomer(customer || null);
    setIsEditMode(!!customer);
    setIsCustomerModalOpen(true);
    dispatch(clearCustomerError());
  };

  const handleOpenPaymentModal = (customer: CustomerDTO) => {
    setActiveCustomer(customer);
    setIsPaymentModalOpen(true);
    dispatch(clearCustomerError());
  };

  const handleCustomerSubmit = async (data: any) => {
    try {
      if (isEditMode && activeCustomer) {
        await dispatch(editCustomer({ id: activeCustomer.id, data })).unwrap();
        toast.success("Customer updated successfully");
      } else {
        await dispatch(addCustomer(data)).unwrap();
        toast.success("Customer added successfully");
      }
      setIsCustomerModalOpen(false);
    } catch (err: any) {
      toast.error(typeof err === 'string' ? err : (err.message || "Failed to save customer"));
    }
  };

  const handlePaymentSubmit = async (data: any) => {
    try {
      if (activeCustomer) {
        await dispatch(processPayment({ id: activeCustomer.id, data })).unwrap();
        toast.success("Payment recorded successfully");
        setIsPaymentModalOpen(false);
      }
    } catch (err: any) {
      toast.error(typeof err === 'string' ? err : (err.message || "Failed to record payment"));
    }
  };

  const totalCredit = items.reduce((acc, c) => acc + Number(c.totalDue), 0);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto w-full space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Customers & Credit</h1>
            <p className="text-slate-500 text-sm">Manage contacts and track credit payments.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
          <div className="bg-rose-50 border border-rose-100 rounded-xl px-4 py-2.5 w-full sm:w-auto text-center sm:text-right">
            <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Total Market Due</p>
            <p className="text-lg font-bold text-rose-600">₹{totalCredit.toFixed(2)}</p>
          </div>
          <button
            onClick={() => handleOpenCustomerModal()}
            className="w-full sm:w-auto flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm"
          >
            <Plus size={18} />Add Customer
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 text-sm font-medium">{error}</div>}

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {isLoading && items.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-[3px] border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-slate-500 text-sm">Loading customers...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-16 text-center">
            <div className="mx-auto w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-slate-300">
              <Users size={30} strokeWidth={1.5} />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1.5">No customers yet</h3>
            <p className="text-slate-500 text-sm mb-5">Build your network to start tracking credit sales.</p>
            <button onClick={() => handleOpenCustomerModal()} className="text-emerald-600 font-semibold text-sm hover:text-emerald-700 transition-colors">
              + Add Customer
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-emerald-100">
                  <th className="px-5 py-3.5 text-xs font-semibold text-emerald-800 uppercase tracking-wider">Customer</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-emerald-800 uppercase tracking-wider">Contact</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-emerald-800 uppercase tracking-wider text-right">Credit Balance</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-emerald-800 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50 transition-colors even:bg-slate-50/50">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800 text-sm">{customer.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5 truncate max-w-[200px]">{customer.address || 'No address'}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-slate-600 text-sm font-medium">{customer.phone}</div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className={`text-sm font-semibold ${Number(customer.totalDue) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        ₹{Number(customer.totalDue).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        {Number(customer.totalDue) > 0 && (
                          <button
                            onClick={() => handleOpenPaymentModal(customer)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
                          >
                            <Wallet size={12} />Receive Pay
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/dashboard/customers/${customer.id}/ledger`)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          <FileText size={12} />Ledger
                        </button>
                        <button onClick={() => handleOpenCustomerModal(customer)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                          <Edit2 size={15} />
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

      {isCustomerModalOpen && (
        <CustomerForm
          initialData={activeCustomer}
          onSubmit={handleCustomerSubmit}
          onClose={() => setIsCustomerModalOpen(false)}
          isLoading={isLoading}
        />
      )}

      {isPaymentModalOpen && activeCustomer && (
        <PaymentForm
          customer={activeCustomer}
          onSubmit={handlePaymentSubmit}
          onClose={() => setIsPaymentModalOpen(false)}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};
