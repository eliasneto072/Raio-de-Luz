import { AppError } from '../../shared/errors/AppError';
import { prisma } from '../../config/prisma';
import { OrderStatus } from '@prisma/client';
import { notificationService } from '../notifications/notifications.service';

export class OrdersService {
  async create(input: any) {
    const { items, customerName, customerEmail, customerPhone, addressData, paymentMethod, couponCode, shippingCost: shippingInput, shippingMethod, notes, userId } = input;

    // Calcular subtotal
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        include: { product: { include: { images: { take: 1 } } } },
      });
      if (!variant) throw new AppError(`Variante ${item.variantId} não encontrada`, 404);
      if (variant.stock < item.quantity) throw new AppError(`Estoque insuficiente para ${variant.product.name}`, 400, 'OUT_OF_STOCK');

      const price = Number(variant.price);
      subtotal += price * item.quantity;
      orderItems.push({
        productId: variant.productId,
        variantId: variant.id,
        productName: variant.product.name,
        variantLabel: [variant.color, variant.size].filter(Boolean).join(' / ') || null,
        coverImage: variant.product.images[0]?.imageUrl || null,
        unitPrice: price,
        quantity: item.quantity,
        totalPrice: price * item.quantity,
      });
    }

    // Desconto por cupom
    let discount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      if (coupon && coupon.active && (!coupon.expiresAt || coupon.expiresAt > new Date())) {
        if (!coupon.minOrderValue || subtotal >= Number(coupon.minOrderValue)) {
          discount = coupon.discountType === 'PERCENTAGE'
            ? subtotal * (Number(coupon.discountValue) / 100)
            : Number(coupon.discountValue);
          await prisma.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } });
        }
      }
    }

    const shippingCost = Number(shippingInput) || 0; // frete escolhido no checkout
    const total = subtotal - discount + shippingCost;

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId: userId || null,
          customerName,
          customerEmail,
          customerPhone,
          paymentMethod,
          couponCode,
          notes,
          subtotal,
          shippingCost,
          discount,
          total,
          ...addressData,
          items: { create: orderItems },
        },
        include: { items: { include: { product: true, variant: true } } },
      });

      // Atualizar estoque
      for (const item of orderItems) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: { decrement: item.quantity },
          },
        });
        await tx.product.update({
          where: { id: item.productId },
          data: { totalSold: { increment: item.quantity } },
        });
      }

      return created;
    });

    // Enviar notificação
    await notificationService.sendOrderConfirmation(order as any).catch(console.error);

    return order;
  }

  async list(filters?: { status?: OrderStatus; startDate?: Date; endDate?: Date; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters?.startDate) where.createdAt.gte = filters.startDate;
      if (filters?.endDate) where.createdAt.lte = filters.endDate;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: { items: { include: { product: true, variant: true } }, user: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    return { orders, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getById(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true, variant: true } }, user: { select: { name: true, email: true, phone: true } } },
    });
    if (!order) throw new AppError('Pedido não encontrado', 404, 'ORDER_NOT_FOUND');
    return order;
  }

  async myOrders(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true, variant: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: OrderStatus, trackingCode?: string) {
    const order = await this.getById(id);
    const updated = await prisma.order.update({
      where: { id },
      data: { status, ...(trackingCode ? { trackingCode } : {}) },
      include: { items: { include: { product: true } }, user: true },
    });

    // Notificar cliente
    if (status === OrderStatus.SHIPPED) {
      await notificationService.sendOrderShipped(updated as any, trackingCode).catch(console.error);
    } else if (status === OrderStatus.DELIVERED) {
      await notificationService.sendOrderDelivered(updated as any).catch(console.error);
    } else if (status === OrderStatus.CANCELED) {
      await notificationService.sendOrderCanceled(updated as any).catch(console.error);
    }

    return updated;
  }

  async getStats(startDate?: Date, endDate?: Date) {
    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [totalOrders, revenue, ordersByStatus, topProducts, recentOrders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.aggregate({ where: { ...where, status: { notIn: [OrderStatus.CANCELED] } }, _sum: { total: true } }),
      prisma.order.groupBy({ by: ['status'], where, _count: true }),
      prisma.orderItem.groupBy({
        by: ['productId', 'productName'],
        where: { order: where },
        _sum: { quantity: true, totalPrice: true },
        orderBy: { _sum: { totalPrice: 'desc' } },
        take: 5,
      }),
      // Pedidos recentes (não-cancelados) para montar a série diária em memória
      prisma.order.findMany({
        where: { ...where, status: { notIn: [OrderStatus.CANCELED] } },
        select: { createdAt: true, total: true },
        orderBy: { createdAt: 'desc' },
        take: 500,
      }),
    ]);

    // Agrupa por dia (YYYY-MM-DD) sem depender de SQL cru
    const dailyMap = new Map<string, { orders: number; revenue: number }>();
    for (const o of recentOrders) {
      const day = o.createdAt.toISOString().split('T')[0];
      const entry = dailyMap.get(day) || { orders: 0, revenue: 0 };
      entry.orders += 1;
      entry.revenue += Number(o.total);
      dailyMap.set(day, entry);
    }
    const dailySales = Array.from(dailyMap.entries())
      .map(([date, v]) => ({ date, orders: v.orders, revenue: v.revenue }))
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 30);

    return {
      totalOrders,
      totalRevenue: Number(revenue._sum.total) || 0,
      ordersByStatus,
      topProducts,
      dailySales,
    };
  }
}

export const ordersService = new OrdersService();