import { Router } from 'express';
import { prisma } from '../../config/prisma';
import { ok } from '../../shared/http/response';
import { authMiddleware } from '../../middlewares/auth.middleware';

export function profileRouter() {
  const router = Router();

  // Atualiza dados e preferências de notificação do usuário logado
  router.patch('/', authMiddleware, async (req, res) => {
    const userId = req.user!.id;
    const { name, phone, whatsapp, notifyEmail, notifyWhatsapp } = req.body as {
      name?: string;
      phone?: string;
      whatsapp?: string;
      notifyEmail?: boolean;
      notifyWhatsapp?: boolean;
    };

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(whatsapp !== undefined && { whatsapp }),
        ...(notifyEmail !== undefined && { notifyEmail }),
        ...(notifyWhatsapp !== undefined && { notifyWhatsapp }),
      },
      select: {
        id: true, name: true, email: true, phone: true, whatsapp: true,
        role: true, notifyEmail: true, notifyWhatsapp: true, createdAt: true,
      },
    });

    ok(res, user);
  });

  return router;
}
