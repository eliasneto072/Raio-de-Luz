export function formatCurrency(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(isNaN(num) ? 0 : num);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

/** Preço efetivo de um produto (promoção quando houver) */
export function effectivePrice(product: {
  basePrice: string | number;
  salePrice?: string | number | null;
}): number {
  const base = typeof product.basePrice === 'string' ? parseFloat(product.basePrice) : product.basePrice;
  if (product.salePrice != null) {
    const sale = typeof product.salePrice === 'string' ? parseFloat(product.salePrice) : product.salePrice;
    if (sale > 0 && sale < base) return sale;
  }
  return base;
}

export function hasDiscount(product: {
  basePrice: string | number;
  salePrice?: string | number | null;
}): boolean {
  if (product.salePrice == null) return false;
  const base = typeof product.basePrice === 'string' ? parseFloat(product.basePrice) : product.basePrice;
  const sale = typeof product.salePrice === 'string' ? parseFloat(product.salePrice) : product.salePrice;
  return sale > 0 && sale < base;
}
