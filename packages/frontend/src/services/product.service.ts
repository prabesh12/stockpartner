import { ProductDTO, CreateProductRequest, UpdateProductRequest } from 'shared';
import { API_BASE_URL } from '../config/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const productService = {
  async getProducts(): Promise<ProductDTO[]> {
    const res = await fetch(`${API_BASE_URL}/products`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  async createProduct(data: CreateProductRequest): Promise<ProductDTO> {
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create product');
    }
    return res.json();
  },

  async updateProduct(id: string, data: UpdateProductRequest): Promise<ProductDTO> {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update product');
    }
    return res.json();
  },

  async deleteProduct(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete product');
    }
  },

  async getPublicProducts(category?: string, search?: string): Promise<ProductDTO[]> {
    let url = `${API_BASE_URL}/products/public`;
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch public products');
    return res.json();
  },

  async getPublicProductDetail(id: string): Promise<ProductDTO & { shop: { name: string; contactNumber: string; address: string } }> {
    const res = await fetch(`${API_BASE_URL}/products/public/${id}`);
    if (!res.ok) throw new Error('Failed to fetch product details');
    return res.json();
  },

  async getPublicCategories(): Promise<string[]> {
    const res = await fetch(`${API_BASE_URL}/products/public/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async getShopProducts(shopId: string, excludeId?: string): Promise<ProductDTO[]> {
    let url = `${API_BASE_URL}/products/public/shop/${shopId}/products`;
    if (excludeId) url += `?excludeId=${excludeId}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch shop products');
    return res.json();
  }
};

export default productService;
