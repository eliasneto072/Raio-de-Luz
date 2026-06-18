// Tipos espelhando o schema do backend (Prisma)

export type UserRole = 'ADMIN' | 'CUSTOMER';

export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'OUT_OF_STOCK' | 'ARCHIVED';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PAID'
  | 'PREPARING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELED';

export type PaymentMethod = 'PIX' | 'CREDIT_CARD' | 'BOLETO' | 'WHATSAPP';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  whatsapp?: string | null;
  notifyEmail?: boolean;
  notifyWhatsapp?: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  active: boolean;
  sortOrder: number;
}

export interface ProductImage {
  id: string;
  imageUrl: string;
  alt?: string | null;
  position: number;
}

export interface ProductVariant {
  id: string;
  sku?: string | null;
  color?: string | null;
  size?: string | null;
  price: string | number;
  stock: number;
}

export interface Product {
  id: string;
  categoryId?: string | null;
  category?: Category | null;
  name: string;
  slug: string;
  description?: string | null;
  details?: string | null;
  status: ProductStatus;
  basePrice: string | number;
  salePrice?: string | number | null;
  isFeatured: boolean;
  isNew: boolean;
  coverImage?: string | null;
  totalSold: number;
  views: number;
  images: ProductImage[];
  variants: ProductVariant[];
  createdAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  product: Product;
  variant: ProductVariant;
}

export interface Cart {
  id?: string;
  items: CartItem[];
}

export interface OrderItem {
  id: string;
  productName: string;
  variantLabel?: string | null;
  coverImage?: string | null;
  unitPrice: string | number;
  quantity: number;
  totalPrice: string | number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  subtotal: string | number;
  shippingCost: string | number;
  discount: string | number;
  total: string | number;
  trackingCode?: string | null;
  notes?: string | null;
  items: OrderItem[];
  createdAt: string;
}

export interface Paginated<T> {
  products: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
