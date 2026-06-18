import { Request, Response } from 'express';
import { ordersService } from './orders.service';
import { ok, created } from '../../shared/http/response';
import { OrderStatus } from '@prisma/client';

export const ordersController = {
  create: async (req: Request, res: Response) => {
    const userId = req.user?.id;
    created(res, await ordersService.create({ ...req.body, userId }));
  },
  list: async (req: Request, res: Response) => {
    const { status, startDate, endDate, page, limit } = req.query;
    ok(res, await ordersService.list({
      status: status as OrderStatus,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    }));
  },
  getById: async (req: Request, res: Response) => {
    const order = await ordersService.getById(req.params.id);
    // Convidado acessa pelo UUID (impossível de adivinhar). Usuário logado só
    // pode ver os próprios pedidos, exceto admin.
    if (req.user && req.user.role !== 'ADMIN' && order.userId && order.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Acesso negado a este pedido' });
    }
    ok(res, order);
  },
  myOrders: async (req: Request, res: Response) => {
    ok(res, await ordersService.myOrders(req.user!.id));
  },
  updateStatus: async (req: Request, res: Response) => {
    const { status, trackingCode } = req.body;
    ok(res, await ordersService.updateStatus(req.params.id, status, trackingCode));
  },
  getStats: async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;
    ok(res, await ordersService.getStats(
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined,
    ));
  },
};