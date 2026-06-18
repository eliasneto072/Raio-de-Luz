import { Router } from 'express';
import { prisma } from '../../config/prisma';
import { ok, created } from '../../shared/http/response';
import { AppError } from '../../shared/errors/AppError';
import { authMiddleware } from '../../middlewares/auth.middleware';

export function favoritesRouter() {
  const router = Router();

  // Lista os favoritos do usuário (com dados do produto)
  router.get('/', authMiddleware, async (req, res) => {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user!.id },
      include: {
        product: {
          include: { category: true, images: true, variants: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    // Retorna os produtos diretamente, mais simples para o front
    ok(res, favorites.map((f) => f.product));
  });

  // Retorna só os IDs favoritados (para marcar corações na UI)
  router.get('/ids', authMiddleware, async (req, res) => {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user!.id },
      select: { productId: true },
    });
    ok(res, favorites.map((f) => f.productId));
  });

  // Adiciona aos favoritos
  router.post('/:productId', authMiddleware, async (req, res) => {
    const { productId } = req.params;
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new AppError('Produto não encontrado', 404, 'PRODUCT_NOT_FOUND');

    await prisma.favorite.upsert({
      where: { userId_productId: { userId: req.user!.id, productId } },
      create: { userId: req.user!.id, productId },
      update: {},
    });
    created(res, { productId, favorited: true });
  });

  // Remove dos favoritos
  router.delete('/:productId', authMiddleware, async (req, res) => {
    const { productId } = req.params;
    await prisma.favorite.deleteMany({
      where: { userId: req.user!.id, productId },
    });
    ok(res, { productId, favorited: false });
  });

  return router;
}
