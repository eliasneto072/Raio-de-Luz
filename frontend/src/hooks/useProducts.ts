import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import type { Product, Category, Paginated } from '@/types';

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => apiGet<Product[]>('/products/featured'),
  });
}

export function useNewProducts() {
  return useQuery({
    queryKey: ['products', 'new'],
    queryFn: () => apiGet<Product[]>('/products/new'),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => apiGet<Category[]>('/categories'),
  });
}

interface ProductListParams {
  categoryId?: string;
  search?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}

export function useProducts(params: ProductListParams = {}) {
  return useQuery({
    queryKey: ['products', 'list', params],
    queryFn: () => apiGet<Paginated<Product>>('/products', params),
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => apiGet<Product>(`/products/slug/${slug}`),
    enabled: !!slug,
  });
}
