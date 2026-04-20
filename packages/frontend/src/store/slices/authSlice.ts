import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AuthUser, LoginRequest, RegisterRequest } from 'shared';
import authService from '../../services/auth.service';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async (data: LoginRequest, thunkAPI) => {
    try {
      return await authService.login(data);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (data: RegisterRequest, thunkAPI) => {
    try {
      return await authService.register(data);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Registration failed');
    }
  }
);

export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, thunkAPI) => {
    try {
      return await authService.getMe();
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Session expired');
    }
  }
);

export const addShopCategory = createAsyncThunk(
  'auth/addCategory',
  async (category: string, thunkAPI) => {
    try {
      return await authService.addCategory(category);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Failed to add category');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = (action.payload.user as AuthUser) || null;
        state.token = action.payload.token || null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.token) {
          state.isAuthenticated = true;
          state.user = (action.payload.user as AuthUser) || null;
          state.token = action.payload.token || null;
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getMe.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem('token');
      })
      .addCase(addShopCategory.fulfilled, (state, action) => {
        if (state.user) {
          state.user.shopCategories = action.payload.categories;
        }
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
