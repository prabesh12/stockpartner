import { CreateSaleRequest, SaleDTO } from 'shared';
import { API_BASE_URL } from '../config/api';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export const saleService = {
  async checkout(data: CreateSaleRequest): Promise<SaleDTO> {
    const res = await fetch(`${API_BASE_URL}/sales/checkout`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw errorData;
    }
    return res.json();
  }
};
