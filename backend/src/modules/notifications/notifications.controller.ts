import { Request, Response } from 'express';
import { notificationService } from './notifications.service';
import { prisma } from '../../config/prisma';
import { ok } from '../../shared/http/response';

export const notificationsController = {
  list: async (req: Request, res: Response) => {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    ok(res, notifications);
  },
  sendPromotional: async (req: Request, res: Response) => {
    const { emails, subject, message } = req.body;
    const result = await notificationService.sendPromotional(emails, subject, message);
    ok(res, result);
  },
};