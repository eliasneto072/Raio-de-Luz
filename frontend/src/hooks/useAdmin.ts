import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiGet, apiPatch } from '@/lib/api';
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
