import { AppError } from '../../shared/errors/AppError';
import { prisma } from '../../config/prisma';
import { ProductStatus } from '@prisma/client';

export class ProductsService {
  async list(filters?: { categoryId?: string; search?: string; featured?: boolean; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { status: ProductStatus.ACTIVE };
    if (filters?.categoryId) where.categoryId = filters.categoryId;
    if (filters?.featured) where.isFeatured = true;
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: { images: { orderBy: { position: 'asc' }, take: 1 }, category: true, variants: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug, status: ProductStatus.ACTIVE },
      include: { images: { orderBy: { position: 'asc' } }, category: true, variants: true },
    });
    if (!product) throw new AppError('Produto não encontrado', 404, 'PRODUCT_NOT_FOUND');

    await prisma.product.update({ where: { id: product.id }, data: { views: { increment: 1 } } });
    return product;
  }

  async getById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { position: 'asc' } }, category: true, variants: true },
    });
    if (!product) throw new AppError('Produto não encontrado', 404, 'PRODUCT_NOT_FOUND');
    return product;
  }

  async create(data: any) {
    const slug = data.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
    return prisma.product.create({
      data: { ...data, slug, variants: data.variants ? { create: data.variants } : undefined },
      include: { images: true, variants: true, category: true },
    });
  }

  async update(id: string, data: any) {
    await this.getById(id);
    return prisma.product.update({
      where: { id },
      data,
      include: { images: true, variants: true, category: true },
    });
  }

  async delete(id: string) {
    await this.getById(id);
    await prisma.product.update({ where: { id }, data: { status: ProductStatus.ARCHIVED } });
  }

  async getFeatured(limit = 8) {
    return prisma.product.findMany({
      where: { status: ProductStatus.ACTIVE, isFeatured: true },
      take: limit,
      include: { images: { orderBy: { position: 'asc' }, take: 1 }, category: true, variants: true },
    });
  }

  async getNew(limit = 8) {
    return prisma.product.findMany({
      where: { status: ProductStatus.ACTIVE, isNew: true },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { images: { orderBy: { position: 'asc' }, take: 1 }, category: true, variants: true },
    });
  }
}

export const productsService = new ProductsService();