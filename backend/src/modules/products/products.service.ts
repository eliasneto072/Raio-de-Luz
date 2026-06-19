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
    const { variants, images, ...rest } = data;
    return prisma.product.create({
      data: {
        ...rest,
        slug,
        variants: variants?.length ? { create: variants } : undefined,
        images: images?.length
          ? { create: images.map((img: any, i: number) => ({ imageUrl: img.imageUrl, alt: img.alt || null, position: i })) }
          : undefined,
      },
      include: { images: true, variants: true, category: true },
    });
  }

  async update(id: string, data: any) {
    await this.getById(id);
    const { variants, images, ...rest } = data;

    // Atualiza campos escalares do produto
    await prisma.product.update({ where: { id }, data: rest });

    // Variantes: atualiza existentes, cria novas e remove as antigas com segurança.
    // Variantes já usadas em pedidos/carrinhos NÃO podem ser apagadas (FK), então
    // essas são preservadas — apenas atualizamos seus dados.
    if (Array.isArray(variants)) {
      const existing = await prisma.productVariant.findMany({
        where: { productId: id },
        include: { _count: { select: { orderItems: true, cartItems: true } } },
      });

      // IDs que o formulário enviou (variantes a manter/atualizar)
      const incomingIds = new Set(variants.filter((v: any) => v.id).map((v: any) => v.id));

      // Remove as que sumiram do formulário E não estão em uso
      const toDelete = existing.filter(
        (v) => !incomingIds.has(v.id) && v._count.orderItems === 0 && v._count.cartItems === 0
      );
      if (toDelete.length > 0) {
        await prisma.productVariant.deleteMany({
          where: { id: { in: toDelete.map((v) => v.id) } },
        });
      }

      // Atualiza ou cria cada variante recebida
      for (const v of variants) {
        const payload = {
          sku: v.sku || null,
          color: v.color || null,
          size: v.size || null,
          price: v.price,
          stock: v.stock ?? 0,
        };
        if (v.id && existing.some((e) => e.id === v.id)) {
          await prisma.productVariant.update({ where: { id: v.id }, data: payload });
        } else {
          await prisma.productVariant.create({ data: { ...payload, productId: id } });
        }
      }
    }

    // Imagens não têm vínculo com pedidos — pode substituir o conjunto
    if (Array.isArray(images)) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      if (images.length > 0) {
        await prisma.productImage.createMany({
          data: images.map((img: any, i: number) => ({
            productId: id,
            imageUrl: img.imageUrl,
            alt: img.alt || null,
            position: i,
          })),
        });
      }
    }

    return this.getById(id);
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