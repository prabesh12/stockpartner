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

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

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
      toast.error(err.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await dispatch(removeProduct(id)).unwrap();
        toast.success('Product deleted');
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete product');
      }
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <Package size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-500 text-sm">Manage your store's inventory and pricing.</p>
          </div>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="w-full md:w-auto flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 font-medium">{error}</div>}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading && items.length === 0 ? (
          <div className="p-12 text-center text-gray-500">Loading products...</div>
        ) : items.length === 0 ? (
          <div className="p-16 text-center">
             <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
                <Package size={32} />
             </div>
             <h3 className="text-lg font-bold text-gray-900 mb-1">No products found</h3>
             <p className="text-gray-500 mb-6">Get started by creating your first product.</p>
             <button onClick={() => handleOpenModal()} className="text-blue-600 font-semibold hover:text-blue-700">
                + Add Product
             </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Product Info</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider text-right">Stock</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider text-right">Price (₹)</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{product.name}</div>
                      <div className="text-xs text-gray-500 font-mono mt-1">{product.barcode || product.sku || 'No Code'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {product.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-semibold ${Number(product.currentStock) <= (product.lowStockThreshold || 5) ? 'text-red-600' : 'text-green-600'}`}>
                        {Number(product.currentStock).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-gray-900 font-medium">₹{Number(product.sellingPrice).toFixed(2)}</div>
                      <div className="text-xs text-gray-400">Cost: ₹{Number(product.costPrice).toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenModal(product)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={18} />
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
