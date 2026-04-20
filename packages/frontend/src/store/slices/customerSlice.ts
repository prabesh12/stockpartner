import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { CustomerDTO, CreateCustomerRequest, RecordPaymentRequest } from 'shared';
import customerService from '../../services/customer.service';

interface CustomerState {
  items: CustomerDTO[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CustomerState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchCustomers = createAsyncThunk('customers/fetch', async (_, thunkAPI) => {
  try {
    return await customerService.getCustomers();
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const addCustomer = createAsyncThunk('customers/add', async (data: CreateCustomerRequest, thunkAPI) => {
  try {
    return await customerService.createCustomer(data);
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const processPayment = createAsyncThunk('customers/payment', async ({ id, data }: { id: string, data: RecordPaymentRequest }, thunkAPI) => {
  try {
    return await customerService.recordPayment(id, data);
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const editCustomer = createAsyncThunk('customers/edit', async ({ id, data }: { id: string, data: Partial<CreateCustomerRequest> }, thunkAPI) => {
  try {
    return await customerService.updateCustomer(id, data);
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    clearCustomerError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(addCustomer.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        const index = state.items.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(editCustomer.fulfilled, (state, action) => {
        const index = state.items.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  }
});

export const { clearCustomerError } = customerSlice.actions;
export default customerSlice.reducer;
