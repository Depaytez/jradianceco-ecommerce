/**
 * Type definitions for JRADIANCE E-Commerce Application
 * Ensures type safety across the entire application
 */


/* User & Authentication Types */
export type UserRole = "customer" | "admin" | "agent" | "chief_admin";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  date_of_birth: string | null;
  gender: string | null;
  preferred_language: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminStaff {
  id: string;
  profile_id: string;
  staff_id: string;
  department: string | null;
  position: string | null;
  manager_id: string | null;
  permissions: Record<string, boolean>;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

/* Product Types */
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  price: number;
  discount_price: number | null;
  stock_quantity: number;
  sku: string | null;
  images: string[];
  attributes: Record<string, string | number | boolean | null>;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  review_text: string | null;
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

/* Shopping Types */
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  added_at: string;
  updated_at: string;
  product?: Product;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  added_at: string;
  product?: Product;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  subtotal: number;
  tax: number;
  shipping_cost: number;
  total_amount: number;
  discount_applied: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  notes: string | null;
  shipping_address: string | null;
  billing_address: string | null;
  estimated_delivery_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface OrderWithItems extends Order {
  items?: OrderItem[];
}

/* Admin Types */
export interface AdminActivityLog {
  id: string;
  admin_id: string;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  changes: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

/* API Response Types */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/* Service Layer Types */
export interface CreateOrderInput {
  items: {
    product_id: string;
    quantity: number;
    unit_price: number;
  }[];
  subtotal: number;
  tax: number;
  shipping_cost: number;
  total_amount: number;
  shipping_address?: string;
  billing_address?: string;
}

export interface ProductFilters {
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
  is_active?: boolean;
}

/* Context Types */
export interface UserContextType {
  user: UserProfile | null;
  authUser: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  isChiefAdmin: boolean;
  refetch: () => Promise<void>;
}
