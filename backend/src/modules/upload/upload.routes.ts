import { Router } from 'express';
import multer from 'multer';
import { uploadService } from './upload.service';
import { ok } from '../../shared/http/response';
import { AppError } from '../../shared/errors/AppError';
import { authMiddleware, adminOnly } from '../../middlewares/auth.middleware';

// Recebe o arquivo em memória (até 5MB, só imagens)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Apenas imagens são permitidas'));
  },
});

export function uploadRouter() {
  const router = Router();

  // Upload de uma imagem (campo "image"), só admin
  router.post('/', authMiddleware, adminOnly, upload.single('image'), async (req, res) => {
    if (!req.file) throw new AppError('Nenhuma imagem enviada', 400, 'NO_FILE');
    const url = await uploadService.uploadImage(req.file.buffer, req.file.originalname);
    ok(res, { url });
  });

  // Upload de várias imagens (campo "images")
  router.post('/multiple', authMiddleware, adminOnly, upload.array('images', 6), async (req, res) => {
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files || files.length === 0) throw new AppError('Nenhuma imagem enviada', 400, 'NO_FILE');
    const urls = await Promise.all(files.map((f) => uploadService.uploadImage(f.buffer, f.originalname)));
    ok(res, { urls });
  });

  return router;
}
