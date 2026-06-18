import { Router } from 'express';
import { notificationsController } from './notifications.controller';
import { authMiddleware, adminOnly } from '../../middlewares/auth.middleware';

export function notificationsRouter() {
  const router = Router();
  router.get('/', authMiddleware, adminOnly, notificationsController.list);
  router.post('/promotional', authMiddleware, adminOnly, notificationsController.sendPromotional);
  return router;
}