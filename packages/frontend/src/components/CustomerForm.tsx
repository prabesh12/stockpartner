import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { CustomerDTO, CreateCustomerRequest } from 'shared';
import { X, Save } from 'lucide-react';

interface CustomerFormProps {
  initialData?: CustomerDTO | null;
  onSubmit: (data: any) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

export const CustomerForm = ({ initialData, onSubmit, onClose, isLoading }: CustomerFormProps) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateCustomerRequest>({
    defaultValues: (initialData as any) || { name: '', phone: '', address: '' }
  });

  useEffect(() => { if (initialData) reset(initialData as any); }, [initialData, reset]);

  const inputClass = "w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[calc(100vh-4rem)] mb-16 md:mb-0">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">
            {initialData ? 'Edit Customer' : 'Add New Customer'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:bg-slate-100 hover:text-slate-700 p-2 rounded-xl transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          <form id="customer-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className={labelClass}>Full Name *</label>
              <input {...register("name", { required: "Name is required" })} className={inputClass} placeholder="Ram Kumar" />
              {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name.message as string}</p>}
            </div>
            <div>
              <label className={labelClass}>Phone Number *</label>
              <input {...register("phone", { required: "Phone is required" })} className={inputClass} placeholder="98..." />
              {errors.phone && <p className="text-rose-500 text-xs mt-1">{errors.phone.message as string}</p>}
            </div>
            <div>
              <label className={labelClass}>Address</label>
              <textarea {...register("address")} className={inputClass} placeholder="Area, City" rows={3} />
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="submit" form="customer-form" disabled={isLoading} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm">
            <Save size={16} />{isLoading ? 'Saving...' : 'Save Customer'}
          </button>
        </div>
      </div>
    </div>
  );
};
