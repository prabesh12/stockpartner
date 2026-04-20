import { CustomerDTO, CreateCustomerRequest, RecordPaymentRequest, CustomerLedgerDTO } from 'shared';
import { API_BASE_URL } from '../config/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const customerService = {
  async getCustomers(): Promise<CustomerDTO[]> {
    const res = await fetch(`${API_BASE_URL}/customers`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch customers');
    return res.json();
  },

  async createCustomer(data: CreateCustomerRequest): Promise<CustomerDTO> {
    const res = await fetch(`${API_BASE_URL}/customers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create customer');
    }
    return res.json();
  },

  async updateCustomer(id: string, data: Partial<CreateCustomerRequest>): Promise<CustomerDTO> {
    const res = await fetch(`${API_BASE_URL}/customers/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to edit customer');
    }
    return res.json();
  },

  async recordPayment(id: string, data: RecordPaymentRequest): Promise<CustomerDTO> {
    const res = await fetch(`${API_BASE_URL}/customers/${id}/payment`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to record payment');
    }
    return res.json();
  },

  async getLedger(id: string): Promise<CustomerLedgerDTO[]> {
    const res = await fetch(`${API_BASE_URL}/customers/${id}/ledger`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to load passbook logic');
    return res.json();
  }
};

export default customerService;
