import { API_BASE_URL } from '../config/api';

const getHeaders = () => {
   return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
   }
};

export const adminService = {
  async getGlobalStats() {
    const res = await fetch(`${API_BASE_URL}/platform-admin/stats`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load global metrics');
    return res.json();
  },

  async getAllShops() {
    const res = await fetch(`${API_BASE_URL}/platform-admin/shops`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch tenants');
    return res.json();
  },

  // ----------------------------------------------------
  // PHASE 2 STUBS: 
  // Currently mock returns to validate UX flow. 
  // Map these to actual express APIs later.
  // ----------------------------------------------------
  async suspendTenant(_shopId: string): Promise<boolean> {
    // Mock network latency
    return new Promise((resolve) => setTimeout(() => resolve(true), 600));
  },

  async inviteOwner(_shopId: string, _email: string): Promise<boolean> {
    return new Promise((resolve) => setTimeout(() => resolve(true), 600));
  },

  async impersonateTenant(_shopId: string): Promise<{ token: string }> {
    return new Promise((resolve) => setTimeout(() => resolve({ token: 'mock-impersonation-token' }), 800));
  }
};
