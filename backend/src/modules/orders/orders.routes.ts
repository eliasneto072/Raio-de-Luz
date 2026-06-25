import { Router } from 'express';
import { ordersController } from './orders.controller';
import { authMiddleware, adminOnly, optionalAuth } from '../../middlewares/auth.middleware';

export function ordersRouter() {
  const router = Router();

  // Cliente (pode ser anônimo)
  router.post('/', optionalAuth, ordersController.create);

  // Autenticado
  router.get('/my', authMiddleware, ordersController.myOrders);

  // Admin
  router.get('/', authMiddleware, adminOnly, ordersController.list);
  router.get('/stats', authMiddleware, adminOnly, ordersController.getStats);
  router.get('/:id', optionalAuth, ordersController.getById);
  router.patch('/:id/status', authMiddleware, adminOnly, ordersController.updateStatus);
  router.delete('/:id', authMiddleware, adminOnly, ordersController.remove);

  return router;
}