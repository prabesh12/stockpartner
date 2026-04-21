import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { ProductDTO } from 'shared';
import { X, Save, Plus, Check } from 'lucide-react';
import { RootState, AppDispatch } from '@/store';
import { addShopCategory } from '@/store/slices/authSlice';
import { ImagePicker } from './ImagePicker';

interface ProductFormProps {
  initialData?: ProductDTO | null;
  onSubmit: (data: any) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

export const ProductForm = ({ initialData, onSubmit, onClose, isLoading }: ProductFormProps) => {
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<any>({
    defaultValues: (initialData as any) || {
      name: '', sku: '', barcode: '', category: '', unitType: 'PCs',
      costPrice: 0, totalPrice: undefined, sellingPrice: 0, currentStock: 0,
    }
  });

  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const GENERIC_CATEGORIES = ['Fruits', 'Vegetables', 'Groceries', 'Hardware Items', 'Electronic Items', 'Apparel', 'Pharmacy', 'Stationery'];
  const categoriesPool = Array.from(new Set([...GENERIC_CATEGORIES, ...(user?.shopCategories || [])]));

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCat, setNewCat] = useState('');
  const [isInjecting, setIsInjecting] = useState(false);

  const handleInjectCategory = async () => {
    if (!newCat.trim()) return;
    setIsInjecting(true);
    await dispatch(addShopCategory(newCat.trim()));
    setIsInjecting(false);
    setNewCat('');
    setIsAddingCategory(false);
  };

  useEffect(() => { if (initialData) reset(initialData as any); }, [initialData, reset]);

  const currentStock = watch('currentStock') || 0;
  const totalPrice = watch('totalPrice');

  useEffect(() => {
    if (totalPrice !== undefined && totalPrice !== '' && currentStock > 0) {
      setValue('costPrice', Number((Number(totalPrice) / Number(currentStock)).toFixed(2)));
    }
  }, [totalPrice, currentStock, setValue]);

  const inputClass = "w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";
  const errorClass = "text-rose-500 text-xs mt-1";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[calc(100vh-4rem)] mb-16 md:mb-0">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">
            {initialData ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:bg-slate-100 hover:text-slate-700 p-2 rounded-xl transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5">
          <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              {/* Name */}
              <div className="col-span-1 md:col-span-2">
                <label className={labelClass}>Product Name *</label>
                <input {...register("name", { required: "Name is required" })} className={inputClass} placeholder="e.g. Premium Rice 5kg" />
                {errors.name && <p className={errorClass}>{errors.name.message as string}</p>}
              </div>

              {/* Category */}
              <div className="flex flex-col">
                <label className={labelClass}>Category *</label>
                {isAddingCategory ? (
                  <div className="flex gap-2">
                    <input
                      type="text" value={newCat} onChange={e => setNewCat(e.target.value)}
                      className={inputClass} placeholder="New category..."
                    />
                    <button type="button" onClick={handleInjectCategory} disabled={isInjecting} className="p-2.5 border border-slate-300 rounded-xl hover:bg-emerald-50 text-emerald-600 hover:border-emerald-300 disabled:opacity-50 transition-colors">
                      <Check size={18} />
                    </button>
                    <button type="button" onClick={() => setIsAddingCategory(false)} className="p-2.5 border border-slate-300 rounded-xl hover:bg-slate-50 text-slate-400 transition-colors">
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <select {...register("category", { required: "Category is required" })} className={inputClass}>
                      <option value="">Select Category</option>
                      {categoriesPool.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <button type="button" onClick={() => setIsAddingCategory(true)} className="p-2.5 border border-slate-300 rounded-xl hover:bg-slate-50 text-slate-500 transition-colors flex-shrink-0" title="Add new category">
                      <Plus size={18} />
                    </button>
                  </div>
                )}
                {errors.category && <p className={errorClass}>{errors.category.message as string}</p>}
              </div>

              {/* Stock + Unit */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className={labelClass}>Stock Qty *</label>
                  <input
                    type="number" step="0.001"
                    {...register("currentStock", { required: "Stock is required", valueAsNumber: true, min: { value: 0.001, message: "Must be > 0" } })}
                    className={inputClass} placeholder="0.000"
                  />
                  {errors.currentStock && <p className={errorClass}>{errors.currentStock.message as string}</p>}
                </div>
                <div className="w-1/3">
                  <label className={labelClass}>Unit</label>
                  <select {...register("unitType")} className={inputClass}>
                    {['PCs', 'Kg', 'Box', 'Liters', 'Dozen', 'Pack', 'Grams'].map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              {/* Bulk cost + Unit cost */}
              <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                <div>
                  <label className={labelClass}>Bulk Total Cost (₹) <span className="font-normal text-slate-400 text-xs">(Optional Auto-calc)</span></label>
                  <input type="number" step="0.01" {...register("totalPrice")} className={inputClass} placeholder="e.g. Paid 500 total" />
                </div>
                <div>
                  <label className={labelClass}>Unit Cost Price (₹) *</label>
                  <input
                    type="number" step="0.01"
                    {...register("costPrice", { required: "Cost Price required", valueAsNumber: true })}
                    className={`${inputClass} border-emerald-300 font-semibold text-emerald-800`}
                    placeholder="0.00"
                  />
                  {errors.costPrice && <p className={errorClass}>{errors.costPrice.message as string}</p>}
                </div>
              </div>

              {/* Selling Price */}
              <div>
                <label className={labelClass}>Selling Price (₹) *</label>
                <input
                  type="number" step="0.01"
                  {...register("sellingPrice", {
                    required: "Selling Price required",
                    valueAsNumber: true,
                    validate: (v) => v > watch('costPrice') || "Must be greater than cost price"
                  })}
                  className={inputClass} placeholder="0.00"
                />
                {errors.sellingPrice && <p className={errorClass}>{errors.sellingPrice.message as string}</p>}
              </div>

              {/* SKU */}
              <div>
                <label className={labelClass}>SKU</label>
                <input {...register("sku")} className={inputClass} placeholder="Internal Code" />
              </div>

              {/* Barcode */}
              <div>
                <label className={labelClass}>Barcode</label>
                <input {...register("barcode")} className={inputClass} placeholder="Scan or type barcode" />
              </div>

              {/* Description */}
              <div className="col-span-1 md:col-span-2">
                <label className={labelClass}>Product Description</label>
                <textarea {...register("description")} rows={3} className={inputClass} placeholder="Tell customers more about your product..." />
              </div>

              {/* Image */}
              <div className="col-span-1 md:col-span-2">
                <ImagePicker label="Product Image" initialValue={watch('imageUrl')} onUploadSuccess={(url) => setValue('imageUrl', url)} />
                <input type="hidden" {...register("imageUrl")} />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="submit" form="product-form" disabled={isLoading} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm">
            <Save size={16} />{isLoading ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </div>
    </div>
  );
};
