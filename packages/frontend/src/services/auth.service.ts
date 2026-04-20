import { LoginRequest, RegisterRequest, AuthResponse, AuthUser } from 'shared';
import { apiClient } from '../utils/apiClient';

const authService = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const result = await apiClient('/auth/register', { data });
    localStorage.setItem('token', result.token);
    return result;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const result = await apiClient('/auth/login', { data });
    localStorage.setItem('token', result.token);
    return result;
  },

  async getMe(): Promise<AuthUser> {
    return await apiClient('/auth/me');
  },

  async addCategory(category: string): Promise<{ categories: string[] }> {
    return await apiClient('/shops/categories', { data: { category } });
  }
};

export default authService;
