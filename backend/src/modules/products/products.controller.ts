import { Request, Response } from 'express';
import { productsService } from './products.service';
import { ok, created, noContent } from '../../shared/http/response';

export const productsController = {
  list: async (req: Request, res: Response) => {
    const { categoryId, search, featured, page, limit } = req.query;
    const result = await productsService.list({
      categoryId: categoryId as string,
      search: search as string,
      featured: featured === 'true',
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
    ok(res, result);
  },
  getBySlug: async (req: Request, res: Response) => {
    ok(res, await productsService.getBySlug(req.params.slug));
  },
  getById: async (req: Request, res: Response) => {
    ok(res, await productsService.getById(req.params.id));
  },
  create: async (req: Request, res: Response) => {
    created(res, await productsService.create(req.body));
  },
  update: async (req: Request, res: Response) => {
    ok(res, await productsService.update(req.params.id, req.body));
  },
  delete: async (req: Request, res: Response) => {
    await productsService.delete(req.params.id);
    noContent(res);
  },
  getFeatured: async (req: Request, res: Response) => {
    ok(res, await productsService.getFeatured());
  },
  getNew: async (req: Request, res: Response) => {
    ok(res, await productsService.getNew());
  },
};