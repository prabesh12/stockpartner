import { LoginRequest, RegisterRequest, AuthResponse, AuthUser, ForgotPasswordRequest, ResetPasswordRequest } from 'shared';
import { apiClient } from '../utils/apiClient';

const authService = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const result = await apiClient('/auth/register', { data });
    if (result.token) {
      localStorage.setItem('token', result.token);
    }
    return result;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const result = await apiClient('/auth/login', { data });
    if (result.token) {
      localStorage.setItem('token', result.token);
    }
    return result;
  },

  async verifyEmail(token: string): Promise<{ message: string }> {
    return await apiClient(`/auth/verify?token=${token}`);
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    return await apiClient('/auth/forgot-password', { data });
  },

  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    return await apiClient('/auth/reset-password', { data });
  },

  async getMe(): Promise<AuthUser> {
    return await apiClient('/auth/me');
  },

  async addCategory(category: string): Promise<{ categories: string[] }> {
    return await apiClient('/shops/categories', { data: { category } });
  }
};

export default authService;
