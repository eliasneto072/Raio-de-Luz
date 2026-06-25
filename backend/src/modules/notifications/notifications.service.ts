import { Resend } from 'resend';
import { env } from '../../config/env';
import { prisma } from '../../config/prisma';
import { NotificationType, NotificationChannel } from '@prisma/client';
import axios from 'axios';

// Cliente do Resend (envio de email por API HTTPS).
// Usamos o Resend porque o Railway bloqueia as portas de SMTP nos planos
// Hobby/grátis — então o nodemailer com Gmail dava timeout. A API do Resend
// usa HTTPS (porta 443), que não é bloqueada.
const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const baseEmailTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background: #fdf5f7; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: #e8184b; padding: 32px; text-align: center; }
    .header h1 { color: #fad882; font-size: 28px; margin: 0; letter-spacing: -0.5px; }
    .header p { color: #fad882; opacity: 0.8; margin: 4px 0 0; font-size: 13px; }
    .body { padding: 32px; }
    .body h2 { color: #1a1a2e; font-size: 20px; margin: 0 0 16px; }
    .body p { color: #555; line-height: 1.6; }
    .order-box { background: #fdf5f7; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .order-id { font-size: 13px; color: #e8184b; font-weight: 600; }
    .item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0e0e4; }
    .total-row { display: flex; justify-content: space-between; font-weight: 600; margin-top: 12px; color: #1a1a2e; }
    .btn { display: inline-block; background: #e8184b; color: #fff !important; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px; }
    .footer { background: #1a1a2e; color: #888; text-align: center; padding: 24px; font-size: 12px; }
    .footer a { color: #fad882; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Raio de Luz</h1>
      <p>✦ Moda Feminina</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>© 2025 Raio de Luz Moda Feminina. Todos os direitos reservados.</p>
      <p><a href="${env.FRONTEND_URL}">Visitar loja</a> • <a href="https://wa.me/${env.STORE_WHATSAPP}">WhatsApp</a></p>
    </div>
  </div>
</body>
</html>
`;

export class NotificationService {
  private async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    // Sem a chave do Resend configurada, não tenta enviar (evita erro em dev).
    if (!resend) {
      console.warn('[email] RESEND_API_KEY não configurada — email não enviado.');
      return false;
    }
    try {
      const { error } = await resend.emails.send({
        from: env.EMAIL_FROM,
        to,
        subject,
        html,
        // Respostas dos clientes caem no email real da loja (se configurado)
        ...(env.EMAIL_REPLY_TO ? { replyTo: env.EMAIL_REPLY_TO } : {}),
      });
      if (error) {
        console.error('[email] falha ao enviar:', error);
        return false;
      }
      return true;
    } catch (err: any) {
      console.error('[email] erro inesperado:', err?.message || err);
      return false;
    }
  }

  private async sendWhatsApp(phone: string, message: string): Promise<boolean> {
    if (!env.WHATSAPP_API_URL || !phone) return false;
    const cleanPhone = phone.replace(/\D/g, '');
    const whatsappPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    try {
      // Evolution API format (adaptável para Z-API, WPPConnect, etc.)
      await axios.post(`${env.WHATSAPP_API_URL}/message/sendText/${env.WHATSAPP_INSTANCE}`, {
        number: whatsappPhone,
        text: message,
      }, {
        headers: { apikey: env.WHATSAPP_API_KEY },
        timeout: 10000,
      });
      return true;
    } catch (err) {
      console.error('[WHATSAPP ERROR]', err);
      return false;
    }
  }

  async sendOrderConfirmation(order: any) {
    const itemsHtml = order.items.map((i: any) =>
      `<div class="item"><span>${i.productName}${i.variantLabel ? ` (${i.variantLabel})` : ''} × ${i.quantity}</span><span>${formatCurrency(Number(i.totalPrice))}</span></div>`
    ).join('');

    const emailHtml = baseEmailTemplate(`
      <h2>Pedido confirmado! 🎉</h2>
      <p>Olá, <strong>${order.customerName}</strong>! Recebemos seu pedido e já estamos preparando tudo com carinho.</p>
      <div class="order-box">
        <div class="order-id">Pedido #${order.id.slice(-8).toUpperCase()}</div>
        ${itemsHtml}
        <div class="total-row"><span>Total</span><span>${formatCurrency(Number(order.total))}</span></div>
      </div>
      <p>Você receberá uma notificação quando seu pedido for enviado.</p>
      <a href="${env.FRONTEND_URL}/pedido/${order.id}" class="btn">Acompanhar pedido</a>
    `);

    const whatsappMsg = `✨ *Raio de Luz — Pedido Confirmado!*\n\nOlá ${order.customerName}! 🌟\n\nSeu pedido *#${order.id.slice(-8).toUpperCase()}* foi confirmado!\n\n💰 Total: *${formatCurrency(Number(order.total))}*\n\nAcompanhe em: ${env.FRONTEND_URL}/pedido/${order.id}\n\nQualquer dúvida, fale conosco aqui no WhatsApp. ❤️`;

    const [emailOk, waOk] = await Promise.all([
      this.sendEmail(order.customerEmail, '✨ Pedido confirmado — Raio de Luz', emailHtml),
      order.customerPhone ? this.sendWhatsApp(order.customerPhone, whatsappMsg) : Promise.resolve(false),
    ]);

    await prisma.notification.create({
      data: {
        userId: order.userId || null,
        orderId: order.id,
        type: NotificationType.ORDER_CONFIRMED,
        channel: NotificationChannel.BOTH,
        subject: 'Pedido confirmado',
        message: `Pedido #${order.id.slice(-8)} confirmado para ${order.customerName}`,
        sentAt: new Date(),
        success: emailOk || waOk,
      },
    });
  }

  async sendOrderShipped(order: any, trackingCode?: string) {
    const emailHtml = baseEmailTemplate(`
      <h2>Seu pedido saiu para entrega! 🚚</h2>
      <p>Olá, <strong>${order.customerName}</strong>! Seu pedido foi enviado e está a caminho!</p>
      ${trackingCode ? `<div class="order-box"><div class="order-id">Código de rastreio</div><p style="font-size:18px;font-weight:600;color:#1a1a2e;margin:8px 0">${trackingCode}</p></div>` : ''}
      <a href="${env.FRONTEND_URL}/pedido/${order.id}" class="btn">Rastrear pedido</a>
    `);

    const whatsappMsg = `🚚 *Raio de Luz — Pedido Enviado!*\n\nOlá ${order.customerName}!\n\nSeu pedido *#${order.id.slice(-8).toUpperCase()}* foi enviado! 📦\n\n${trackingCode ? `📍 Rastreio: *${trackingCode}*\n\n` : ''}Acompanhe em: ${env.FRONTEND_URL}/pedido/${order.id}`;

    await Promise.all([
      this.sendEmail(order.customerEmail, '🚚 Seu pedido foi enviado — Raio de Luz', emailHtml),
      order.customerPhone ? this.sendWhatsApp(order.customerPhone, whatsappMsg) : Promise.resolve(false),
    ]);
  }

  async sendOrderDelivered(order: any) {
    const emailHtml = baseEmailTemplate(`
      <h2>Pedido entregue! 🎊</h2>
      <p>Olá, <strong>${order.customerName}</strong>! Seu pedido foi entregue com sucesso.</p>
      <p>Esperamos que você <strong>ame</strong> suas novas peças! 💕</p>
      <a href="${env.FRONTEND_URL}" class="btn">Ver novidades</a>
    `);
    await this.sendEmail(order.customerEmail, '🎊 Pedido entregue — Raio de Luz', emailHtml);
  }

  async sendOrderCanceled(order: any) {
    const emailHtml = baseEmailTemplate(`
      <h2>Pedido cancelado</h2>
      <p>Olá, <strong>${order.customerName}</strong>. Seu pedido <strong>#${order.id.slice(-8).toUpperCase()}</strong> foi cancelado.</p>
      <p>Se você não solicitou o cancelamento ou tem alguma dúvida, fale conosco pelo WhatsApp.</p>
      <a href="https://wa.me/${env.STORE_WHATSAPP}" class="btn">Falar com a loja</a>
    `);
    await this.sendEmail(order.customerEmail, 'Pedido cancelado — Raio de Luz', emailHtml);
  }

  async sendPromotional(emails: string[], subject: string, message: string) {
    const results = await Promise.allSettled(
      emails.map(email => this.sendEmail(email, subject, baseEmailTemplate(`<h2>${subject}</h2><p>${message}</p><a href="${env.FRONTEND_URL}" class="btn">Ver ofertas</a>`)))
    );
    const success = results.filter(r => r.status === 'fulfilled').length;
    return { total: emails.length, success, failed: emails.length - success };
  }
}

export const notificationService = new NotificationService();