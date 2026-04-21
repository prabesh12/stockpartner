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
import { ShoppingCart, Plus, Minus, X, Banknote, UserRound, ArrowRight, WifiOff, Search } from 'lucide-react';
import { ProductDTO, CustomerDTO } from 'shared';
import { getPendingSalesCount } from '@/utils/offlineQueue';
import toast from 'react-hot-toast';

export const POS = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: products, isLoading: productsLoading } = useSelector((state: RootState) => state.products);
  const { items: customers } = useSelector((state: RootState) => state.customers);
  const { cart, customerId, discountAmount, paidAmount, paymentMethod, isProcessing, error } = useSelector((state: RootState) => state.pos);

  const [offlineCount, setOfflineCount] = useState(0);
  const [search, setSearch] = useState('');

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

  const filtered = products.filter((p: ProductDTO) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

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
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <ShoppingCart size={18} className="text-emerald-600" /> Product Catalog
            </h2>
            {offlineCount > 0 && (
              <div className="flex items-center gap-1.5 bg-amber-100 text-amber-800 px-3 py-1.5 rounded-lg text-xs font-semibold animate-pulse">
                <WifiOff size={13} />
                <span>{offlineCount} Offline Queued</span>
              </div>
            )}
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or barcode..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm bg-slate-50 transition-colors"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {productsLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-[3px] border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filtered.map((p: ProductDTO) => (
                <button
                  key={p.id}
                  disabled={p.currentStock <= 0}
                  onClick={() => dispatch(addToCart(p))}
                  className={`text-left p-3.5 rounded-xl border transition-all ${p.currentStock > 0
                    ? 'bg-white border-slate-200 hover:border-emerald-400 hover:shadow-md cursor-pointer active:scale-[0.98]'
                    : 'bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed'
                    }`}
                >
                  <h3 className="font-semibold text-slate-800 text-sm truncate leading-snug" title={p.name}>{p.name}</h3>
                  <p className="text-sm font-bold text-emerald-600 mt-1.5">₹{Number(p.sellingPrice).toFixed(2)}</p>
                  <div className="mt-2.5">
                    <span className={`text-[10px] px-2 py-1 rounded-md font-semibold ${p.currentStock <= (p.lowStockThreshold || 5)
                      ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                      {p.currentStock} in stock
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Cart */}
      <div className="w-full md:w-[360px] bg-white flex flex-col border-t md:border-t-0 border-slate-200 flex-none">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-800">
          <h2 className="font-bold text-white flex items-center gap-2"><ShoppingCart size={18} />Current Order</h2>
          <button onClick={() => dispatch(clearCart())} className="text-slate-400 hover:text-white text-xs font-semibold transition-colors">Clear All</button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-3 py-12">
              <ShoppingCart size={44} strokeWidth={1.5} />
              <p className="font-medium text-sm text-slate-400">Cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex flex-col p-3 border border-slate-100 rounded-xl bg-slate-50 relative group">
                <button
                  onClick={() => dispatch(removeFromCart(item.id))}
                  className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm border border-slate-200 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-slate-800 text-sm w-3/4 truncate">{item.name}</h4>
                  <span className="font-bold text-slate-900 text-sm">₹{Number(item.total).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">₹{Number(item.sellingPrice).toFixed(2)} / unit</span>
                  <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1">
                    <button onClick={() => dispatch(updateCartItemQuantity({ id: item.id, quantity: item.cartQuantity - 1 }))} disabled={item.cartQuantity <= 1} className="text-slate-500 hover:text-emerald-600 disabled:opacity-30 transition-colors"><Minus size={13} /></button>
                    <input
                      type="number" min="1" max={Number(item.currentStock)} value={item.cartQuantity}
                      onChange={(e) => { const val = parseInt(e.target.value, 10); if (!isNaN(val)) dispatch(updateCartItemQuantity({ id: item.id, quantity: val })); }}
                      className="text-sm font-semibold w-10 text-center bg-transparent outline-none focus:ring-1 focus:ring-emerald-500 rounded px-1 appearance-none"
                    />
                    <button onClick={() => dispatch(updateCartItemQuantity({ id: item.id, quantity: item.cartQuantity + 1 }))} disabled={item.cartQuantity >= Number(item.currentStock)} className="text-slate-500 hover:text-emerald-600 disabled:opacity-30 transition-colors"><Plus size={13} /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-200 bg-white space-y-4">
          {error && <div className="text-xs font-semibold text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-100">{error}</div>}

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Customer (Optional)</label>
              <select
                value={customerId || ''}
                onChange={(e) => dispatch(setCustomer(e.target.value || null))}
                className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
              >
                <option value="">Guest Walk-in</option>
                {customers.map((c: CustomerDTO) => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Discount (₹)</label>
                <input type="number" min="0" value={discountAmount} onChange={e => dispatch(setPaymentDetails({ discountAmount: Number(e.target.value) }))} className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1 block"><Banknote size={11} />Paid Upfront</label>
                <input type="number" min="0" max={finalAmount} value={paidAmount} onChange={e => dispatch(setPaymentDetails({ paidAmount: Number(e.target.value) }))} className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
            </div>

            <div className="flex rounded-xl overflow-hidden border border-slate-300">
              {(['CASH', 'UPI', 'CARD'] as const).map((method, i) => (
                <button
                  key={method}
                  onClick={() => dispatch(setPaymentDetails({ paymentMethod: method }))}
                  className={`flex-1 py-2 text-xs font-bold transition-colors ${i > 0 ? 'border-l border-slate-300' : ''} ${paymentMethod === method ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                >
                  {method === 'UPI' ? 'E-WALLET' : method === 'CARD' ? 'MOB BANK' : 'CASH'}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200">
            <div className="flex justify-between items-end mb-3">
              <span className="text-slate-500 font-semibold text-sm">Amount Due</span>
              <span className="text-3xl font-black text-emerald-600 tracking-tight">₹{finalAmount.toFixed(2)}</span>
            </div>

            {customerId && finalAmount > paidAmount && (
              <div className="mb-3 bg-amber-50 border border-amber-200 p-2.5 rounded-xl flex items-center gap-2 text-xs font-medium text-amber-800">
                <UserRound size={13} className="text-amber-600 shrink-0" />
                <span>Adding ₹{(finalAmount - paidAmount).toFixed(2)} credit to customer balance.</span>
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || isProcessing}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-bold text-base transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              {isProcessing ? 'Processing...' : 'Complete Checkout'} <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
