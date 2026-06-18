import { Router } from 'express';
import { prisma } from '../../config/prisma';
import { ok, created, noContent } from '../../shared/http/response';
import { authMiddleware, adminOnly } from '../../middlewares/auth.middleware';

export function categoriesRouter() {
  const router = Router();

  router.get('/', async (_req, res) => {
    const cats = await prisma.category.findMany({ where: { active: true }, orderBy: { sortOrder: 'asc' } });
    ok(res, cats);
  });

  router.post('/', authMiddleware, adminOnly, async (req, res) => {
    const { name, description, imageUrl } = req.body;
    const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-');
    const cat = await prisma.category.create({ data: { name, slug, description, imageUrl } });
    created(res, cat);
  });

  router.patch('/:id', authMiddleware, adminOnly, async (req, res) => {
    const cat = await prisma.category.update({ where: { id: req.params.id }, data: req.body });
    ok(res, cat);
  });

  router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
    await prisma.category.update({ where: { id: req.params.id }, data: { active: false } });
    noContent(res);
  });

  return router;
}