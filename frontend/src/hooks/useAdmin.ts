import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiGet, apiPost, apiPatch, apiPut, apiDelete } from '@/lib/api';
import type { Order, OrderStatus, Paginated, Product } from '@/types';

// ---- Estatísticas do dashboard ----
export interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  ordersByStatus: { status: string; _count: number }[];
  topProducts: { productName: string; _sum: { quantity: number; totalPrice: number } }[];
  dailySales: { date: string; orders: number; revenue: number }[];
}

export function useAdminStats(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['admin', 'stats', startDate, endDate],
    queryFn: () => apiGet<AdminStats>('/orders/stats', { startDate, endDate }),
  });
}

// ---- Pedidos (admin) ----
export function useAdminOrders(params: { status?: string; page?: number } = {}) {
  return useQuery({
    queryKey: ['admin', 'orders', params],
    queryFn: () => apiGet<Paginated<Order> & { orders: Order[] }>('/orders', { ...params, limit: 50 }),
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, trackingCode }: { id: string; status: OrderStatus; trackingCode?: string }) =>
      apiPatch<Order>(`/orders/${id}/status`, { status, trackingCode }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

export function useDeleteOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete<{ id: string; deleted: boolean }>(`/orders/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

// ---- Produtos (admin) ----
export function useAdminProducts() {
  return useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => apiGet<Paginated<Product>>('/products', { limit: 100 }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'products'] }),
  });
}

/** Busca um produto completo por id (com todas as imagens e variantes) — usado na edição */
export function useProductById(id?: string) {
  return useQuery({
    queryKey: ['admin', 'product', id],
    queryFn: () => apiGet<Product>(`/products/${id}`),
    enabled: !!id,
    staleTime: 0, // sempre busca dados frescos ao editar
  });
}

export interface ProductFormData {
  name: string;
  description?: string;
  details?: string;
  categoryId?: string;
  basePrice: number;
  salePrice?: number | null;
  status: string;
  isFeatured: boolean;
  isNew: boolean;
  coverImage?: string;
  images?: { imageUrl: string; alt?: string }[];
  variants?: { id?: string; sku?: string; color?: string; size?: string; price: number; stock: number }[];
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ProductFormData) => apiPost<Product>('/products', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] });
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductFormData> }) =>
      apiPatch<Product>(`/products/${id}`, data),
    onSuccess: () => {
      // Invalida tudo relacionado a produtos: admin, vitrine (featured/new) e detalhes
      qc.invalidateQueries({ queryKey: ['admin', 'products'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['product'] });
    },
  });
}

// ---- Download de relatório PDF (binário, com token) ----
export async function downloadReport(
  type: 'orders' | 'products',
  range?: { startDate?: string; endDate?: string }
) {
  const response = await api.get(`/reports/${type}`, {
    params: range,
    responseType: 'blob',
  });

  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const suffix = range?.startDate ? `_${range.startDate}_${range.endDate}` : '';
  link.download = `relatorio_${type}${suffix}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

// ---- Configuração de frete grátis (admin) ----
export interface FreeShippingConfig {
  enabled: boolean;
  minPurchase: number;
  cap: number;
}

export function useFreeShippingConfig() {
  return useQuery({
    queryKey: ['admin', 'free-shipping'],
    queryFn: () => apiGet<FreeShippingConfig>('/settings/admin/free-shipping'),
  });
}

export function useUpdateFreeShipping() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (config: FreeShippingConfig) => apiPut<FreeShippingConfig>('/settings/admin/free-shipping', config),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'free-shipping'] }),
  });
}

// ---- Cupons (admin) ----
export interface Coupon {
  id: string;
  code: string;
  description?: string | null;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderValue?: number | null;
  maxUses?: number | null;
  usedCount: number;
  active: boolean;
  expiresAt?: string | null;
}

export interface CouponInput {
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderValue?: number | null;
  maxUses?: number | null;
  active: boolean;
  expiresAt?: string | null;
}

export function useAdminCoupons() {
  return useQuery({
    queryKey: ['admin', 'coupons'],
    queryFn: () => apiGet<Coupon[]>('/coupons'),
  });
}

export function useCreateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CouponInput) => apiPost<Coupon>('/coupons', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'coupons'] }),
  });
}

export function useUpdateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CouponInput> }) =>
      apiPatch<Coupon>(`/coupons/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'coupons'] }),
  });
}

export function useDeleteCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/coupons/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'coupons'] }),
  });
}

// ---- Textos do site (admin) ----
export interface SiteTexts {
  announcementBar: string;
  heroEyebrow: string;
  heroTitle: string;
  badge1Title: string;
  badge1Sub: string;
  badge2Title: string;
  badge2Sub: string;
  badge3Title: string;
  badge3Sub: string;
  couponEyebrow: string;
  couponTitle: string;
  couponText: string;
  couponButton: string;
}

export function useSiteTextsAdmin() {
  return useQuery({
    queryKey: ['admin', 'site-texts'],
    queryFn: () => apiGet<SiteTexts>('/settings/site-texts'),
  });
}

export function useUpdateSiteTexts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (texts: SiteTexts) => apiPut<SiteTexts>('/settings/admin/site-texts', texts),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'site-texts'] }),
  });
}

// ---- Categorias (admin) ----
export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  active: boolean;
  sortOrder: number;
  _count?: { products: number };
}

export interface CategoryInput {
  name: string;
  description?: string;
  imageUrl?: string | null;
  active?: boolean;
}

export function useAdminCategories() {
  return useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => apiGet<AdminCategory[]>('/categories/all'),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CategoryInput) => apiPost<AdminCategory>('/categories', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CategoryInput> }) =>
      apiPatch<AdminCategory>(`/categories/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/categories/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
