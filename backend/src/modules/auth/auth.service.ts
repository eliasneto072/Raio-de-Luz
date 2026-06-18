import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppError } from '../../shared/errors/AppError';
import { prisma } from '../../config/prisma';
import { generateToken } from './auth.helpers';
import { tokenBlacklist } from '../../config/tokenBlacklist';
import { env } from '../../config/env';

export class AuthService {
  async register(input: { name: string; email: string; password: string; phone?: string }) {
    const exists = await prisma.user.findUnique({ where: { email: input.email } });
    if (exists) throw new AppError('E-mail já cadastrado', 409, 'EMAIL_EXISTS');

    const hashed = await bcrypt.hash(input.password, 10);
    const user = await prisma.user.create({
      data: { ...input, password: hashed },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    });

    const token = generateToken(user.id, user.role);
    return { token, user };
  }

  async login(input: { email: string; password: string }) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) throw new AppError('Credenciais inválidas', 401, 'INVALID_CREDENTIALS');

    const match = await bcrypt.compare(input.password, user.password);
    if (!match) throw new AppError('Credenciais inválidas', 401, 'INVALID_CREDENTIALS');

    const token = generateToken(user.id, user.role);
    const { password: _, ...publicUser } = user;
    return { token, user: publicUser };
  }

  async logout(token: string) {
    try {
      const payload = jwt.decode(token) as { exp?: number } | null;
      const expiresAt = payload?.exp ? payload.exp * 1000 : Date.now() + 3600_000;
      tokenBlacklist.add(token, expiresAt);
    } catch {}
  }

  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true, role: true, whatsapp: true, notifyEmail: true, notifyWhatsapp: true, createdAt: true },
    });
    if (!user) throw new AppError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    return user;
  }
}

export const authService = new AuthService();