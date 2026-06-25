import { v2 as cloudinary } from 'cloudinary';
import { env } from '../../config/env';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const hasCloudinary = !!(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET
);

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
}

// Pasta local de fallback (quando Cloudinary não está configurado)
const LOCAL_DIR = path.resolve(process.cwd(), 'uploads');
if (!hasCloudinary && !fs.existsSync(LOCAL_DIR)) {
  fs.mkdirSync(LOCAL_DIR, { recursive: true });
}

export const uploadService = {
  isCloudinary: hasCloudinary,

  /** Recebe o buffer de uma imagem e retorna a URL pública */
  async uploadImage(buffer: Buffer, originalName: string): Promise<string> {
    if (hasCloudinary) {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'raio-de-luz/produtos',
            resource_type: 'image',
            // Otimização automática: limita o tamanho máximo (sem distorcer),
            // ajusta a qualidade de forma inteligente e escolhe o melhor
            // formato (ex.: WebP). Deixa a loja leve mesmo com fotos grandes.
            transformation: [
              { width: 1600, height: 1600, crop: 'limit' },
              { quality: 'auto', fetch_format: 'auto' },
            ],
          },
          (err, result) => {
            if (err || !result) return reject(err || new Error('Falha no upload'));
            resolve(result.secure_url);
          }
        );
        stream.end(buffer);
      });
    }

    // Fallback local: salva em /uploads e serve via /api/uploads/...
    const ext = path.extname(originalName) || '.jpg';
    const filename = `${crypto.randomBytes(8).toString('hex')}${ext}`;
    fs.writeFileSync(path.join(LOCAL_DIR, filename), buffer);
    return `${env.API_URL || 'http://localhost:3333'}/api/uploads/${filename}`;
  },
};
