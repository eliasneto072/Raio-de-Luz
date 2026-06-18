import { config } from 'dotenv';
config();

export const env = {
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  NODE_ENV: process.env.NODE_ENV,

  // Email (Nodemailer / SMTP)
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587'),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  EMAIL_FROM: process.env.EMAIL_FROM || '"Raio de Luz" <contato@raiodeluz.com>',

  // WhatsApp (Evolution API / Z-API / etc)
  WHATSAPP_API_URL: process.env.WHATSAPP_API_URL || '',
  WHATSAPP_API_KEY: process.env.WHATSAPP_API_KEY || '',
  WHATSAPP_INSTANCE: process.env.WHATSAPP_INSTANCE || '',
  STORE_WHATSAPP: process.env.STORE_WHATSAPP || '5588999999999',

  // Cloudinary (opcional)
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',

  // Frontend URL (para links em emails)
  FRONTEND_URL: process.env.FRONTEND_URL,
};