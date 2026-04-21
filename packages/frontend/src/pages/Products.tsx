import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchProducts, addProduct, editProduct, removeProduct, clearProductError } from '@/store/slices/productSlice';
import { ProductDTO } from 'shared';
import { ProductForm } from '@/components/ProductForm';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';
import toast from 'react-hot-toast';

export const Products = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, isLoading, error } = useSelector((state: RootState) => state.products);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDTO | null>(null);

  useEffect(() => { dispatch(fetchProducts()); }, [dispatch]);

  const handleOpenModal = (product?: ProductDTO) => {
    setEditingProduct(product || null);
    setIsModalOpen(true);
    dispatch(clearProductError());
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (editingProduct) {
        await dispatch(editProduct({ id: editingProduct.id, data })).unwrap();
        toast.success('Product updated successfully');
      } else {
        await dispatch(addProduct(data)).unwrap();
        toast.success('Product added successfully');
      }
      handleCloseModal();
    } catch (err: any) {
      toast.error(typeof err === 'string' ? err : (err.message || 'Failed to save product'));
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await dispatch(removeProduct(id)).unwrap();
        toast.success('Product deleted');
      } catch (err: any) {
        toast.error(typeof err === 'string' ? err : (err.message || 'Failed to delete product'));
      }
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto w-full space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <Package size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Products</h1>
            <p className="text-slate-500 text-sm">Manage your store's inventory and pricing.</p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="w-full md:w-auto flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm"
        >
          <Plus size={18} />Add Product
        </button>
      </div>

      {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 text-sm font-medium">{error}</div>}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading && items.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-[3px] border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-slate-500 text-sm">Loading products...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-16 text-center">
            <div className="mx-auto w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-slate-300">
              <Package size={30} strokeWidth={1.5} />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1.5">No products yet</h3>
            <p className="text-slate-500 text-sm mb-5">Get started by adding your first product.</p>
            <button onClick={() => handleOpenModal()} className="text-emerald-600 font-semibold text-sm hover:text-emerald-700 transition-colors">
              + Add Product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Stock</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Price</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800 text-sm">{product.name}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">{product.barcode || product.sku || '—'}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600">
                        {product.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className={`text-sm font-bold ${Number(product.currentStock) <= (product.lowStockThreshold || 5) ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {Number(product.currentStock).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="text-slate-800 font-semibold text-sm">₹{Number(product.sellingPrice).toFixed(2)}</div>
                      <div className="text-xs text-slate-400">Cost: ₹{Number(product.costPrice).toFixed(2)}</div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => handleOpenModal(product)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                          <Trash2 size={16} />
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

      {isModalOpen && (
        <ProductForm
          initialData={editingProduct}
          onSubmit={handleSubmit}
          onClose={handleCloseModal}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};
