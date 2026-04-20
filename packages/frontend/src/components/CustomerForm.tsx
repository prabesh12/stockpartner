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
    defaultValues: (initialData as any) || {
      name: '',
      phone: '',
      address: '',
    }
  });

  useEffect(() => {
    if (initialData) reset(initialData as any);
  }, [initialData, reset]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col max-h-[calc(100vh-8rem)] mb-16 md:mb-0">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            {initialData ? 'Edit Customer' : 'Add New Customer'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full">
            <X size={20} />
          </button>
        </div>
        
        <div className="overflow-y-auto p-6 space-y-4">
          <form id="customer-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
            <input
              {...register("name", { required: "Name is required" })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ram Kumar"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message as string}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number *</label>
            <input
              {...register("phone", { required: "Phone is required" })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="98..."
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message as string}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
            <textarea
              {...register("address")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Area, City"
              rows={3}
            />
          </div>
          </form>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg">Cancel</button>
          <button type="submit" form="customer-form" disabled={isLoading} className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg disabled:opacity-50">
            <Save size={18} /> {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};
