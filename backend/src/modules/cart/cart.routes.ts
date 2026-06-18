import { Router } from 'express';
import { prisma } from '../../config/prisma';
import { ok } from '../../shared/http/response';
import { optionalAuth } from '../../middlewares/auth.middleware';

export function cartRouter() {
  const router = Router();

  const getCart = async (userId?: string, sessionId?: string) => {
    const where = userId ? { userId } : { sessionId };
    return prisma.cart.findFirst({
      where,
      include: {
        items: {
          include: {
            product: { include: { images: { take: 1, orderBy: { position: 'asc' as any } } } },
            variant: true,
          },
        },
      },
    });
  };

  router.get('/', optionalAuth, async (req, res) => {
    const sessionId = req.headers['x-session-id'] as string;
    const cart = await getCart(req.user?.id, sessionId);
    ok(res, cart || { items: [] });
  });

  router.post('/items', optionalAuth, async (req, res) => {
    const sessionId = req.headers['x-session-id'] as string;
    const { variantId, productId, quantity } = req.body;

    const where = req.user?.id ? { userId: req.user.id } : { sessionId };
    let cart = await prisma.cart.findFirst({ where });

    if (!cart) {
      cart = await prisma.cart.create({
        data: req.user?.id ? { userId: req.user.id } : { sessionId },
      });
    }

    const existing = await prisma.cartItem.findUnique({
      where: { cartId_variantId: { cartId: cart.id, variantId } },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, variantId, quantity },
      });
    }

    const updated = await getCart(req.user?.id, sessionId);
    ok(res, updated);
  });

  router.patch('/items/:id', optionalAuth, async (req, res) => {
    const { quantity } = req.body;
    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: req.params.id } });
    } else {
      await prisma.cartItem.update({ where: { id: req.params.id }, data: { quantity } });
    }
    const sessionId = req.headers['x-session-id'] as string;
    const cart = await getCart(req.user?.id, sessionId);
    ok(res, cart);
  });

  router.delete('/items/:id', optionalAuth, async (req, res) => {
    await prisma.cartItem.delete({ where: { id: req.params.id } });
    const sessionId = req.headers['x-session-id'] as string;
    const cart = await getCart(req.user?.id, sessionId);
    ok(res, cart);
  });

  return router;
}