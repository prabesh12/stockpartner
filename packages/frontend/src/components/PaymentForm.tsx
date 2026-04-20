import { useForm } from 'react-hook-form';
import { CustomerDTO, RecordPaymentRequest } from 'shared';
import { X, CheckCircle } from 'lucide-react';

interface PaymentFormProps {
  customer: CustomerDTO;
  onSubmit: (data: RecordPaymentRequest) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

export const PaymentForm = ({ customer, onSubmit, onClose, isLoading }: PaymentFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<RecordPaymentRequest>();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-green-50 rounded-t-xl">
          <h2 className="text-xl font-bold text-green-800">Record Payment</h2>
          <button onClick={onClose} className="text-green-600 hover:bg-green-100 p-2 rounded-full">
            <X size={20} />
          </button>
        </div>
        
        <form id="payment-form" onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg text-sm mb-2 border border-gray-100">
            <p className="text-gray-500">Receiving from:</p>
            <p className="font-bold text-gray-900">{customer.name}</p>
            <div className="mt-2 flex justify-between">
               <span className="text-gray-600">Current Due:</span>
               <span className="font-bold text-red-600">₹{Number(customer.totalDue).toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Amount Given (₹) *</label>
            <input
              type="number"
              step="0.01"
              {...register("amount", { required: "Amount required", valueAsNumber: true, min: { value: 0.01, message: "Must be positive" } })}
              className="w-full px-4 py-3 text-lg font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="0.00"
            />
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message as string}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Notes (Optional)</label>
            <input
              {...register("notes")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
              placeholder="e.g. Paid in cash"
            />
          </div>
        </form>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg">Cancel</button>
          <button type="submit" form="payment-form" disabled={isLoading} className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50 transition-colors">
            <CheckCircle size={18} /> {isLoading ? 'Processing...' : 'Confirm Payment'}
          </button>
        </div>
      </div>
    </div>
  );
};
