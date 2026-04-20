import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { ProductDTO } from 'shared';
import { X, Save, Plus, Check } from 'lucide-react';
import { RootState, AppDispatch } from '@/store';
import { addShopCategory } from '@/store/slices/authSlice';

interface ProductFormProps {
  initialData?: ProductDTO | null;
  onSubmit: (data: any) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

export const ProductForm = ({ initialData, onSubmit, onClose, isLoading }: ProductFormProps) => {
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<any>({
    defaultValues: (initialData as any) || {
      name: '',
      sku: '',
      barcode: '',
      category: '',
      unitType: 'PCs',
      costPrice: 0,
      totalPrice: undefined,
      sellingPrice: 0,
      currentStock: 0,
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

  useEffect(() => {
    if (initialData) reset(initialData as any);
  }, [initialData, reset]);

  const currentStock = watch('currentStock') || 0;
  const totalPrice = watch('totalPrice');

  useEffect(() => {
    if (totalPrice !== undefined && totalPrice !== '' && currentStock > 0) {
      const computedUnitCost = (Number(totalPrice) / Number(currentStock)).toFixed(2);
      setValue('costPrice', Number(computedUnitCost));
    }
  }, [totalPrice, currentStock, setValue]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[calc(100vh-8rem)] mb-16 md:mb-0">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            {initialData ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="overflow-y-auto p-6">
          <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name *</label>
                <input
                  {...register("name", { required: "Name is required" })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. Premium Rice 5kg"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message as string}</p>}
              </div>

              <div className="flex flex-col">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                {isAddingCategory ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="New category..."
                      value={newCat}
                      onChange={e => setNewCat(e.target.value)}
                    />
                    <button type="button" onClick={handleInjectCategory} disabled={isInjecting} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-blue-600 disabled:opacity-50">
                      <Check size={20} />
                    </button>
                    <button type="button" onClick={() => setIsAddingCategory(false)} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-400">
                       <X size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col w-full gap-1">
                    <div className="flex gap-2">
                      <select
                        {...register("category", { required: "Category is required" })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      >
                        <option value="">Select Category</option>
                        {categoriesPool.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                      <button type="button" onClick={() => setIsAddingCategory(true)} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-500 flex-shrink-0" title="Add new category">
                        <Plus size={20} />
                      </button>
                    </div>
                    {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message as string}</p>}
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    step="0.001"
                    {...register("currentStock", { valueAsNumber: true, min: { value: 0, message: "Cannot be negative" } })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.000"
                  />
                  {errors.currentStock && <p className="text-red-500 text-xs mt-1">{errors.currentStock.message as string}</p>}
                </div>
                <div className="w-1/3">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Unit</label>
                  <select
                    {...register("unitType")}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="PCs">PCs</option>
                    <option value="Kg">Kg</option>
                    <option value="Box">Box</option>
                    <option value="Liters">Liters</option>
                    <option value="Dozen">Dozen</option>
                    <option value="Pack">Pack</option>
                    <option value="Grams">Grams</option>
                  </select>
                </div>
              </div>

              <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Bulk Total Cost (₹) <span className="font-normal text-gray-500 text-xs">(Optional Auto-calc)</span></label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("totalPrice")}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    placeholder="e.g. Paid 500 total"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Unit Cost Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("costPrice", { required: "Cost Price required", valueAsNumber: true })}
                    className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-blue-900 bg-white shadow-sm"
                    placeholder="0.00"
                  />
                  {errors.costPrice && <p className="text-red-500 text-xs mt-1">{errors.costPrice.message as string}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Selling Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  {...register("sellingPrice", { required: "Selling Price required", valueAsNumber: true })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
                {errors.sellingPrice && <p className="text-red-500 text-xs mt-1">{errors.sellingPrice.message as string}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">SKU</label>
                <input
                  {...register("sku")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Internal Code"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Barcode</label>
                <input
                  {...register("barcode")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Scan or type barcode"
                />
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="product-form"
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Save size={18} />
            {isLoading ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </div>
    </div>
  );
};
