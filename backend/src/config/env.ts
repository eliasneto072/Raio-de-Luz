import { config } from 'dotenv';
config();

export const env = {
  PORT: parseInt(process.env.PORT || '3333'),
  API_URL: process.env.API_URL || `http://localhost:${process.env.PORT || '3333'}`,
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'raio-de-luz-dev-secret-troque-em-producao',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Email (Nodemailer / SMTP)
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587'),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  EMAIL_FROM: process.env.EMAIL_FROM || '"Raio de Luz" <contato@raiodeluz.com>',
  // Resend (envio de email por API HTTPS — funciona onde o SMTP é bloqueado)
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  EMAIL_REPLY_TO: process.env.EMAIL_REPLY_TO || '',

  // WhatsApp (Evolution API / Z-API / etc)
  WHATSAPP_API_URL: process.env.WHATSAPP_API_URL || '',
  WHATSAPP_API_KEY: process.env.WHATSAPP_API_KEY || '',
  WHATSAPP_INSTANCE: process.env.WHATSAPP_INSTANCE || '',
  STORE_WHATSAPP: process.env.STORE_WHATSAPP || '5583998154641',

  // Cloudinary (opcional)
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',

  // Mercado Pago (Checkout Pro)
  MP_ACCESS_TOKEN: process.env.MP_ACCESS_TOKEN || '',
  MP_PUBLIC_KEY: process.env.MP_PUBLIC_KEY || '',
  MP_WEBHOOK_SECRET: process.env.MP_WEBHOOK_SECRET || '',

  // Melhor Envio (cálculo de frete)
  MELHOR_ENVIO_TOKEN: process.env.MELHOR_ENVIO_TOKEN || '',
  MELHOR_ENVIO_SANDBOX: process.env.MELHOR_ENVIO_SANDBOX || 'true',
  STORE_CEP_ORIGEM: process.env.STORE_CEP_ORIGEM || '',

  // Frete grátis (regra inteligente — só dá grátis se compensar)
  FRETE_GRATIS_MIN_COMPRA: process.env.FRETE_GRATIS_MIN_COMPRA || '250',
  FRETE_GRATIS_TETO: process.env.FRETE_GRATIS_TETO || '30',

  // Frontend URL (para links em emails)
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
};