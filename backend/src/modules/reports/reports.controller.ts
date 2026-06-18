import { Request, Response } from 'express';
import { reportsService } from './reports.service';

export const reportsController = {
  orders: async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : new Date(new Date().setDate(1));
    const end = endDate ? new Date(endDate as string) : new Date();
    await reportsService.generateOrdersReport(start, end, res);
  },
  products: async (_req: Request, res: Response) => {
    await reportsService.generateProductsReport(res);
  },
};