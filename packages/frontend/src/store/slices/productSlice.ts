import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ProductDTO, CreateProductRequest, UpdateProductRequest } from 'shared';
import productService from '../../services/product.service';

interface ProductState {
  items: ProductDTO[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchProducts = createAsyncThunk('products/fetch', async (_, thunkAPI) => {
  try {
    return await productService.getProducts();
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const addProduct = createAsyncThunk('products/add', async (data: CreateProductRequest, thunkAPI) => {
  try {
    return await productService.createProduct(data);
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const editProduct = createAsyncThunk('products/edit', async ({ id, data }: { id: string, data: UpdateProductRequest }, thunkAPI) => {
  try {
    return await productService.updateProduct(id, data);
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const removeProduct = createAsyncThunk('products/remove', async (id: string, thunkAPI) => {
  try {
    await productService.deleteProduct(id);
    return id;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProductError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(editProduct.fulfilled, (state, action) => {
        const index = state.items.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(removeProduct.fulfilled, (state, action) => {
        state.items = state.items.filter(p => p.id !== action.payload);
      });
  }
});

export const { clearProductError } = productSlice.actions;
export default productSlice.reducer;
