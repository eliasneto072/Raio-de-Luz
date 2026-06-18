import { Request, Response } from 'express';
import { authService } from './auth.service';
import { ok, created } from '../../shared/http/response';

export const authController = {
  register: async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    created(res, result);
  },
  login: async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    ok(res, result);
  },
  logout: async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split(' ')[1] || '';
    await authService.logout(token);
    ok(res, { message: 'Logout realizado' });
  },
  me: async (req: Request, res: Response) => {
    const user = await authService.me(req.user!.id);
    ok(res, user);
  },
};