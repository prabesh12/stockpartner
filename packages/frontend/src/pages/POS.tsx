import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchProducts } from '@/store/slices/productSlice';
import { fetchCustomers } from '@/store/slices/customerSlice';
import { 
  addToCart, 
  updateCartItemQuantity, 
  removeFromCart, 
  setCustomer, 
  setPaymentDetails, 
  clearCart, 
  submitSale 
} from '@/store/slices/posSlice';
import { ShoppingCart, Plus, Minus, X, Banknote, UserRound, ArrowRight, WifiOff } from 'lucide-react';
import { ProductDTO, CustomerDTO } from 'shared';
import { getPendingSalesCount } from '@/utils/offlineQueue';
import toast from 'react-hot-toast';

export const POS = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: products, isLoading: productsLoading } = useSelector((state: RootState) => state.products);
  const { items: customers } = useSelector((state: RootState) => state.customers);
  const { cart, customerId, discountAmount, paidAmount, paymentMethod, isProcessing, error } = useSelector((state: RootState) => state.pos);

  const [offlineCount, setOfflineCount] = useState(0);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCustomers());

    const checkQueue = async () => {
      const count = await getPendingSalesCount();
      setOfflineCount(count);
    };
    checkQueue();
    const interval = setInterval(checkQueue, 2000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const finalAmount = subtotal - discountAmount;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    const res = await dispatch(submitSale());
    if (submitSale.fulfilled.match(res)) {
       const respPayload = res.payload as any;
       if (respPayload?.offline) {
         toast.success("Network Offline! Sale cached locally. It will auto-sync when connection restores.", { icon: '⚠️', duration: 4000 });
       } else {
         toast.success("Sale Processed Successfully!");
       }
       dispatch(fetchProducts());
       setOfflineCount(await getPendingSalesCount());
    } else {
       toast.error(error || "Failed to process sale");
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-auto min-h-screen md:h-screen bg-slate-50 md:overflow-hidden">
      {/* LEFT: Product Catalog */}
      <div className="w-full md:flex-1 flex flex-col border-b md:border-r border-slate-200 min-h-[50vh] md:min-h-0 md:overflow-hidden">
         <div className="p-4 bg-white border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                 <ShoppingCart className="text-indigo-600" /> Catalog
              </h2>
              {offlineCount > 0 && (
                <div className="flex items-center gap-2 bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full text-xs font-semibold animate-pulse">
                   <WifiOff size={14} />
                   <span>{offlineCount} Offline Sales Queued</span>
                </div>
              )}
            </div>
            <input 
               type="text" 
               placeholder="Search product by name or barcode..." 
               className="mt-3 w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            />
         </div>
         <div className="flex-1 overflow-y-auto p-4">
            {productsLoading ? (
               <div className="text-slate-500 font-medium text-center p-8">Loading Inventory...</div>
            ) : (
               <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-2 md:p-4">
                  {products.map((p: ProductDTO) => (
                     <button
                        key={p.id}
                        disabled={p.currentStock <= 0}
                        onClick={() => dispatch(addToCart(p))}
                        className={`text-left p-4 rounded-2xl shadow-sm border ${p.currentStock > 0 ? 'bg-white hover:border-indigo-400 hover:shadow-md cursor-pointer transition-all' : 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'}`}
                     >
                        <h3 className="font-semibold text-slate-900 truncate" title={p.name}>{p.name}</h3>
                        <p className="text-sm font-bold text-indigo-600 mt-1">₹{Number(p.sellingPrice).toFixed(2)}</p>
                        <div className="mt-3 flex justify-between items-center text-xs">
                           <span className={`px-2 py-1 rounded-md font-medium ${p.currentStock <= (p.lowStockThreshold || 5) ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                              {p.currentStock} in stock
                           </span>
                        </div>
                     </button>
                  ))}
               </div>
            )}
         </div>
      </div>

      {/* RIGHT: Register Cart */}
      <div className="w-full md:w-96 bg-white flex flex-col shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-10 flex-none">
         <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex justify-between items-center">
            <h2 className="font-bold text-lg">Current Order</h2>
            <button onClick={() => dispatch(clearCart())} className="text-slate-400 hover:text-white text-sm font-medium">Clear All</button>
         </div>
         
         <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                  <ShoppingCart size={48} className="opacity-20" />
                  <p className="font-medium">Cart is empty</p>
               </div>
            ) : (
               cart.map(item => (
                  <div key={item.id} className="flex flex-col p-3 border border-slate-100 rounded-xl bg-slate-50 relative group">
                     <button onClick={() => dispatch(removeFromCart(item.id))} className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm border border-slate-200 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={14} />
                     </button>
                     <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-slate-800 text-sm w-3/4 truncate">{item.name}</h4>
                        <span className="font-bold text-slate-900 text-sm">₹{Number(item.total).toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">₹{Number(item.sellingPrice).toFixed(2)} / unit</span>
                        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg p-1">
                           <button onClick={() => dispatch(updateCartItemQuantity({ id: item.id, quantity: item.cartQuantity - 1 }))} disabled={item.cartQuantity <= 1} className="text-slate-500 hover:text-slate-900 disabled:opacity-30"><Minus size={14}/></button>
                           <input 
                              type="number" 
                              min="1" 
                              max={Number(item.currentStock)}
                              value={item.cartQuantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                if (!isNaN(val)) dispatch(updateCartItemQuantity({ id: item.id, quantity: val }));
                              }}
                              className="text-sm font-semibold w-12 text-center bg-transparent outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1 appearance-none" 
                           />
                           <button onClick={() => dispatch(updateCartItemQuantity({ id: item.id, quantity: item.cartQuantity + 1 }))} disabled={item.cartQuantity >= Number(item.currentStock)} className="text-slate-500 hover:text-slate-900 disabled:opacity-30"><Plus size={14}/></button>
                        </div>
                     </div>
                  </div>
               ))
            )}
         </div>

         <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-4 shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)] relative z-20">
            {error && <div className="text-xs font-semibold text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">{error}</div>}
            
            <div className="space-y-3">
               <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Customer (Optional)</label>
                  <select 
                     value={customerId || ''}
                     onChange={(e) => dispatch(setCustomer(e.target.value || null))}
                     className="w-full text-sm p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                     <option value="">Guest Walk-in</option>
                     {customers.map((c: CustomerDTO) => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
                  </select>
               </div>

               <div className="grid grid-cols-2 gap-3">
                  <div>
                     <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Discount</label>
                     <input type="number" min="0" value={discountAmount} onChange={e => dispatch(setPaymentDetails({ discountAmount: Number(e.target.value) }))} className="w-full text-sm p-2 rounded-lg border border-slate-300 outline-none" />
                  </div>
                  <div>
                     <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 gap-1 flex items-center"><Banknote size={12}/> Paid Upfront</label>
                     <input type="number" min="0" max={finalAmount} value={paidAmount} onChange={e => dispatch(setPaymentDetails({ paidAmount: Number(e.target.value) }))} className="w-full text-sm p-2 rounded-lg border border-slate-300 outline-none" />
                  </div>
               </div>

               <div className="flex rounded-lg overflow-hidden border border-slate-300">
                  <button onClick={() => dispatch(setPaymentDetails({ paymentMethod: 'CASH' }))} className={`flex-1 py-1.5 text-xs font-bold ${paymentMethod === 'CASH' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>CASH</button>
                  <button onClick={() => dispatch(setPaymentDetails({ paymentMethod: 'UPI' }))} className={`flex-1 py-1.5 text-xs font-bold border-l border-slate-300 ${paymentMethod === 'UPI' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>E-WALLET</button>
                  <button onClick={() => dispatch(setPaymentDetails({ paymentMethod: 'CARD' }))} className={`flex-1 py-1.5 text-xs font-bold border-l border-slate-300 ${paymentMethod === 'CARD' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>MOB BANK</button>
               </div>
            </div>

            <div className="pt-3 border-t border-slate-200">
               <div className="flex justify-between items-end mb-4">
                  <span className="text-slate-500 font-semibold uppercase text-sm">Amount Due</span>
                  <span className="text-3xl font-black text-indigo-600 tracking-tight">₹{finalAmount.toFixed(2)}</span>
               </div>
               
               {customerId && finalAmount > paidAmount && (
                  <div className="mb-4 bg-amber-50 border border-amber-200 p-2 rounded-lg flex items-center gap-2 text-xs font-medium text-amber-800">
                     <UserRound size={14} className="text-amber-600"/>
                     <span>Adding ₹{(finalAmount - paidAmount).toFixed(2)} Udhar to customer balance.</span>
                  </div>
               )}

               <button 
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || isProcessing}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:text-slate-500 text-white rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
               >
                  {isProcessing ? 'Processing Transaction...' : 'Complete Checkout'} <ArrowRight size={20} />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};
