import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { CreateSaleRequest, ProductDTO } from 'shared';
import { saleService } from '../../services/sale.service';
import { enqueueSale, getAllPendingSales, removeSaleFromQueue } from '../../utils/offlineQueue';

export interface CartItem extends ProductDTO {
  cartQuantity: number;
  total: number;
}

interface POSState {
  cart: CartItem[];
  customerId: string | null;
  discountAmount: number;
  paidAmount: number;
  paymentMethod: 'CASH' | 'UPI' | 'CARD' | 'CREDIT';
  notes: string;
  isProcessing: boolean;
  error: string | null;
}

const initialState: POSState = {
  cart: [],
  customerId: null,
  discountAmount: 0,
  paidAmount: 0,
  paymentMethod: 'CASH',
  notes: '',
  isProcessing: false,
  error: null,
};

export const submitSale = createAsyncThunk(
  'pos/submitSale',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = (getState() as any).pos as POSState;
      const totalAmount = state.cart.reduce((sum, item) => sum + item.total, 0);
      const finalAmount = totalAmount - state.discountAmount;
      
      const payload: CreateSaleRequest = {
        items: state.cart.map(item => ({
          productId: item.id,
          quantity: item.cartQuantity,
          unitPrice: item.sellingPrice,
          total: item.total
        })),
        customerId: state.customerId || undefined,
        totalAmount,
        discountAmount: state.discountAmount,
        finalAmount,
        paidAmount: state.paidAmount,
        paymentMethod: state.paymentMethod,
        notes: state.notes
      };

      if (!navigator.onLine) {
        await enqueueSale(payload);
        return { offline: true, message: 'Saved to Offline Queue' };
      }

      return await saleService.checkout(payload);
    } catch (err: any) {
      if (!err.error && (err instanceof TypeError || err.message === 'Failed to fetch')) {
        const state = (getState() as any).pos as POSState;
        const totalAmount = state.cart.reduce((sum, item) => sum + item.total, 0);
        const finalAmount = totalAmount - state.discountAmount;
      
        const payload: CreateSaleRequest = {
          items: state.cart.map(item => ({
            productId: item.id,
            quantity: item.cartQuantity,
            unitPrice: item.sellingPrice,
            total: item.total
          })),
          customerId: state.customerId || undefined,
          totalAmount,
          discountAmount: state.discountAmount,
          finalAmount,
          paidAmount: state.paidAmount,
          paymentMethod: state.paymentMethod,
          notes: state.notes
        };
        await enqueueSale(payload);
        return { offline: true, message: 'Network failed. Saved to Offline Queue' };
      }
      return rejectWithValue(err.message || 'Checkout failed internally');
    }
  }
);

export const syncOfflineSales = createAsyncThunk(
  'pos/syncOfflineSales',
  async () => {
    if (!navigator.onLine) return;
    
    const pendingSales = await getAllPendingSales();
    if (pendingSales.length === 0) return;

    for (const sale of pendingSales) {
      try {
        await saleService.checkout(sale.payload);
        await removeSaleFromQueue(sale.id);
      } catch (err: any) {
        // If it throws a hard data validation error from backend (e.g. out of stock), we might want to log it and remove it,
        // but for now, we leave it in the queue, or remove it if it's 400.
        if (err.error) {
           console.error('Offline sync rejected by server:', err.error);
           await removeSaleFromQueue(sale.id); // Wipe corrupted out-of-sync carts to unblock
        }
      }
    }
  }
);

const posSlice = createSlice({
  name: 'pos',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<ProductDTO>) => {
      const existing = state.cart.find(i => i.id === action.payload.id);
      if (existing) {
        if (existing.cartQuantity < Number(existing.currentStock)) {
           existing.cartQuantity += 1;
           existing.total = existing.cartQuantity * Number(existing.sellingPrice);
        }
      } else {
        if (Number(action.payload.currentStock) > 0) {
           state.cart.push({ ...action.payload, cartQuantity: 1, total: Number(action.payload.sellingPrice) });
        }
      }
    },
    updateCartItemQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.cart.find(i => i.id === action.payload.id);
      if (item && action.payload.quantity >= 1 && action.payload.quantity <= Number(item.currentStock)) {
        item.cartQuantity = action.payload.quantity;
        item.total = item.cartQuantity * Number(item.sellingPrice);
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cart = state.cart.filter(i => i.id !== action.payload);
    },
    setCustomer: (state, action: PayloadAction<string | null>) => {
      state.customerId = action.payload;
    },
    setPaymentDetails: (state, action: PayloadAction<Partial<POSState>>) => {
      return { ...state, ...action.payload };
    },
    clearCart: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitSale.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(submitSale.fulfilled, () => {
        return initialState; 
      })
      .addCase(submitSale.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload as string;
      });
  }
});

export const { addToCart, updateCartItemQuantity, removeFromCart, setCustomer, setPaymentDetails, clearCart } = posSlice.actions;
export default posSlice.reducer;
