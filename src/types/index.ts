// Common Error Interface
export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
}

// Auth Types
export interface User {
  userId: number;
  username: string;
  email: string;
  roles?: string[];
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  userId: number;
  username: string;
  email: string;
  roles?: string[]; // Note: Frontend will populate this from mapping email admin@example.com -> ROLE_ADMIN
}

// Product Types
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  active: boolean;
  categoryName: string;
}

// Category Types
export interface Category {
  id: number;
  name: string;
  description?: string;
}

// Cart Types
export interface CartItem {
  id?: number; // Database ID (sometimes missing from backend CartItemResponse, we map productId if missing)
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface Cart {
  cartId: number;
  items: CartItem[];
  grandTotal: number;
}

// Address Types
export interface Address {
  id: number;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

// Order Types
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: number;
  totalAmount: number;
  status: OrderStatus;
  items: OrderItem[];
  createdAt?: string; // Optional field if returned or mapped
}

// Payment Types
export type PaymentMethod = 'CARD' | 'UPI' | 'NET_BANKING' | 'WALLET';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface PaymentInitResponse {
  paymentId: number;
  gatewayOrderId: string;
  amount: number;
  currency: string;
  key: string;
  status: string;
}

export interface PaymentVerifyResponse {
  paymentId: number;
  gatewayOrderId: string;
  amount: number;
  currency: string;
  key: string;
  status: PaymentStatus;
}
