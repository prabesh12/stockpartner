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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-800">Record Payment</h2>
            <p className="text-xs text-slate-400 mt-0.5">From: {customer.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:bg-slate-100 hover:text-slate-700 p-2 rounded-xl transition-colors">
            <X size={18} />
          </button>
        </div>

        <form id="payment-form" onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          {/* Balance info */}
          <div className="bg-rose-50 border border-rose-100 rounded-xl p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Outstanding Due</span>
              <span className="font-bold text-rose-600 text-base">₹{Number(customer.totalDue).toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Amount Received (₹) *</label>
            <input
              type="number" step="0.01"
              {...register("amount", { required: "Amount required", valueAsNumber: true, min: { value: 0.01, message: "Must be positive" } })}
              className="w-full px-4 py-3 text-lg font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-800 placeholder-slate-300"
              placeholder="0.00"
            />
            {errors.amount && <p className="text-rose-500 text-xs mt-1">{errors.amount.message as string}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Notes (Optional)</label>
            <input
              {...register("notes")}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              placeholder="e.g. Paid in cash"
            />
          </div>
        </form>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="submit" form="payment-form" disabled={isLoading} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl disabled:opacity-50 transition-colors shadow-sm">
            <CheckCircle size={16} />{isLoading ? 'Processing...' : 'Confirm Payment'}
          </button>
        </div>
      </div>
    </div>
  );
};
