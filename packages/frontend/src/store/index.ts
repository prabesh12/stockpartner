import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
import customerReducer from './slices/customerSlice';
import posReducer from './slices/posSlice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
    products: productReducer,
    customers: customerReducer,
    pos: posReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
