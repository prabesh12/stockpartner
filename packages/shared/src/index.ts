export type HealthStatus = {
  status: 'ok' | 'error';
  timestamp: string;
};

export type UserRole = 'OWNER' | 'STAFF' | 'PLATFORM_ADMIN';

export interface AuthUser {
  id: string;
  shopId: string;
  shopName?: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  shopCategories?: string[];
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface LoginRequest {
  email?: string;
  phone?: string;
  password?: string;
}

export interface RegisterRequest {
  shopName: string;
  userName: string;
  email?: string;
  phone?: string;
  password?: string;
  categories?: string[];
}

export interface CreateProductRequest {
  name: string;
  sku?: string;
  barcode?: string;
  category?: string;
  unitType?: string;
  costPrice?: number;
  sellingPrice?: number;
  currentStock?: number;
  lowStockThreshold?: number;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export interface ProductDTO {
  id: string;
  shopId: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  category: string | null;
  unitType: string;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  lowStockThreshold: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerDTO {
  id: string;
  shopId: string;
  name: string;
  phone: string;
  address: string | null;
  totalDue: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerLedgerDTO {
  id: string;
  type: 'CREDIT' | 'PAYMENT';
  amount: number;
  balanceAfter: number;
  referenceId: string | null;
  notes: string | null;
  createdAt: string;
}

export interface CreateCustomerRequest {
  name: string;
  phone: string;
  address?: string;
}

export interface RecordPaymentRequest {
  customerId: string;
  amount: number;
  paymentMethod: 'CASH' | 'UPI' | 'CARD' | 'CREDIT';
  notes?: string;
}

export interface DashboardSummaryDTO {
  dailySalesCount: number;
  dailyRevenue: number;
  dailyProfit: number;
  totalRevenue: number;
  topSellingProducts: {
    productId: string;
    name: string;
    totalQuantitySold: number;
    revenueGenerated: number;
  }[];
  lowStockProducts: ProductDTO[];
}

export interface SaleItemRequest {
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface CreateSaleRequest {
  items: SaleItemRequest[];
  customerId?: string;
  totalAmount: number;
  discountAmount?: number;
  finalAmount: number;
  paidAmount: number;
  paymentMethod: 'CASH' | 'UPI' | 'CARD' | 'CREDIT';
  notes?: string;
}

export interface SaleDTO {
  id: string;
  shopId: string;
  userId: string;
  customerId: string | null;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paidAmount: number;
  paymentMethod: string;
  createdAt: string;
}
