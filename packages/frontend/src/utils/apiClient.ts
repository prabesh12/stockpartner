import { store } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { API_BASE_URL } from '@/config/api';

interface FetchOptions extends RequestInit {
  data?: any;
}

export const apiClient = async (endpoint: string, options: FetchOptions = {}) => {
  const { data, headers: customHeaders, ...customConfig } = options;
  const token = localStorage.getItem('token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customHeaders,
  };

  const config: RequestInit = {
    method: data ? 'POST' : 'GET',
    body: data ? JSON.stringify(data) : undefined,
    headers,
    ...customConfig,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Global 401 Unauthorized Interceptor
    // Note: If /auth/login returns a 401 (wrong password), we shouldn't force log them out
    // because they are already logged out trying to log in. So we ignore 401s on login endpoint.
    if (response.status === 401 && !endpoint.includes('/auth/login')) {
      store.dispatch(logout()); // Clears auth state → ProtectedRoute redirects to marketplace
      throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || 'An unexpected error occurred');
    }

    // Attempt to return JSON, otherwise return null (for 204 No Content etc)
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    throw error;
  }
};
