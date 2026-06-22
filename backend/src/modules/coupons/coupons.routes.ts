import { Router } from 'express';
import { prisma } from '../../config/prisma';
import { ok } from '../../shared/http/response';
import { AppError } from '../../shared/errors/AppError';
import { authMiddleware, adminOnly } from '../../middlewares/auth.middleware';

export function couponsRouter() {
  const router = Router();

  // ----- Admin: listar todos os cupons -----
  router.get('/', authMiddleware, adminOnly, async (_req, res) => {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
    ok(res, coupons.map((c) => ({
      ...c,
      discountValue: Number(c.discountValue),
      minOrderValue: c.minOrderValue != null ? Number(c.minOrderValue) : null,
    })));
  });

  // ----- Admin: criar cupom -----
  router.post('/', authMiddleware, adminOnly, async (req, res) => {
    const { code, description, discountType, discountValue, minOrderValue, maxUses, active, expiresAt } = req.body;
    if (!code || !discountType || discountValue == null) {
      throw new AppError('Código, tipo e valor do desconto são obrigatórios', 400, 'INVALID_INPUT');
    }
    const created = await prisma.coupon.create({
      data: {
        code: String(code).toUpperCase().trim(),
        description: description || null,
        discountType, // "PERCENTAGE" | "FIXED"
        discountValue: Number(discountValue),
        minOrderValue: minOrderValue ? Number(minOrderValue) : null,
        maxUses: maxUses ? Number(maxUses) : null,
        active: active !== false,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });
    ok(res, created);
  });

  // ----- Admin: atualizar cupom -----
  router.patch('/:id', authMiddleware, adminOnly, async (req, res) => {
    const { description, discountType, discountValue, minOrderValue, maxUses, active, expiresAt } = req.body;
    const updated = await prisma.coupon.update({
      where: { id: req.params.id },
      data: {
        description: description ?? undefined,
        discountType: discountType ?? undefined,
        discountValue: discountValue != null ? Number(discountValue) : undefined,
        minOrderValue: minOrderValue !== undefined ? (minOrderValue ? Number(minOrderValue) : null) : undefined,
        maxUses: maxUses !== undefined ? (maxUses ? Number(maxUses) : null) : undefined,
        active: active !== undefined ? active : undefined,
        expiresAt: expiresAt !== undefined ? (expiresAt ? new Date(expiresAt) : null) : undefined,
      },
    });
    ok(res, updated);
  });

  // ----- Admin: excluir cupom -----
  router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
    await prisma.coupon.delete({ where: { id: req.params.id } });
    ok(res, { deleted: true });
  });

  // Valida um cupom para um determinado subtotal (público, usado no carrinho)
  router.post('/validate', async (req, res) => {
    const { code, subtotal } = req.body as { code?: string; subtotal?: number };

    if (!code) throw new AppError('Informe o código do cupom', 400, 'COUPON_CODE_REQUIRED');

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon || !coupon.active) {
      throw new AppError('Cupom inválido', 404, 'COUPON_INVALID');
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      throw new AppError('Cupom expirado', 400, 'COUPON_EXPIRED');
    }

    const sub = Number(subtotal || 0);
    if (coupon.minOrderValue && sub < Number(coupon.minOrderValue)) {
      throw new AppError(
        `Este cupom é válido para compras acima de R$ ${Number(coupon.minOrderValue).toFixed(2)}`,
        400,
        'COUPON_MIN_ORDER'
      );
    }

    const discount =
      coupon.discountType === 'PERCENTAGE'
        ? sub * (Number(coupon.discountValue) / 100)
        : Number(coupon.discountValue);

    ok(res, {
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
      discount: Math.min(discount, sub),
    });
  });

  return router;
}
