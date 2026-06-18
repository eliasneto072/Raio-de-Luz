import { Router } from 'express';
import { prisma } from '../../config/prisma';
import { ok } from '../../shared/http/response';
import { AppError } from '../../shared/errors/AppError';

export function couponsRouter() {
  const router = Router();

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
