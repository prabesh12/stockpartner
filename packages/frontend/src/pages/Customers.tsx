import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '@/store';
import { fetchCustomers, addCustomer, editCustomer, processPayment, clearCustomerError } from '@/store/slices/customerSlice';
import { CustomerDTO } from 'shared';
import { CustomerForm } from '@/components/CustomerForm';
import { PaymentForm } from '@/components/PaymentForm';
import { Users, Edit2, Wallet, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export const Customers = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items, isLoading, error } = useSelector((state: RootState) => state.customers);
  
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activeCustomer, setActiveCustomer] = useState<CustomerDTO | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

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
      const msg = typeof err === 'string' ? err : (err.message || "Failed to save customer");
      toast.error(msg);
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
      const msg = typeof err === 'string' ? err : (err.message || "Failed to record payment");
      toast.error(msg);
    }
  };

  const calculateTotalUdhar = () => items.reduce((acc, c) => acc + Number(c.totalDue), 0);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
            <Users size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customers & Udhar</h1>
            <p className="text-gray-500 text-sm">Manage contacts and track credit payments.</p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 w-full md:w-auto">
          <div className="text-left md:text-right w-full md:w-auto">
             <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Market Due</p>
             <p className="text-xl font-bold text-red-600">₹{calculateTotalUdhar().toFixed(2)}</p>
          </div>
          <button 
            onClick={() => handleOpenCustomerModal()}
            className="w-full md:w-auto flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm"
          >
            <Users size={18} /> Add Customer
          </button>
        </div>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 font-medium">{error}</div>}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading && items.length === 0 ? (
          <div className="p-12 text-center text-gray-500">Loading customers...</div>
        ) : items.length === 0 ? (
          <div className="p-16 text-center">
             <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
                <Users size={32} />
             </div>
             <h3 className="text-lg font-bold text-gray-900 mb-1">No customers yet</h3>
             <p className="text-gray-500 mb-6">Build your network to start tracking credit sales.</p>
             <button onClick={() => handleOpenCustomerModal()} className="text-indigo-600 font-semibold">
                + Add Customer
             </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Customer Details</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider text-right">Udhar Balance</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{customer.name}</div>
                      <div className="text-xs text-gray-500 mt-1 truncate max-w-[200px]">{customer.address || 'No address'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 font-medium flex items-center gap-1">{customer.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-bold ${Number(customer.totalDue) > 0 ? 'text-red-500' : 'text-green-600'}`}>
                        ₹{Number(customer.totalDue).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {Number(customer.totalDue) > 0 && (
                          <button 
                            onClick={() => handleOpenPaymentModal(customer)} 
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors border border-green-200"
                          >
                            <Wallet size={14} /> Receive Pay
                          </button>
                        )}
                        <button 
                          onClick={() => navigate(`/dashboard/customers/${customer.id}/ledger`)} 
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors border border-blue-200"
                          title="View Passbook"
                        >
                          <FileText size={14} /> Ledger
                        </button>
                        <button onClick={() => handleOpenCustomerModal(customer)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                          <Edit2 size={18} />
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
