import PDFDocument from 'pdfkit';
import { prisma } from '../../config/prisma';
import { OrderStatus } from '@prisma/client';
import { Response } from 'express';

const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
const formatDate = (d: Date) => new Intl.DateTimeFormat('pt-BR').format(d);

const PINK = '#e8184b';
const GOLD = '#fad882';
const DARK = '#1a1a2e';
const GRAY = '#888888';

export class ReportsService {
  async generateOrdersReport(startDate: Date, endDate: Date, res: Response) {
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: { notIn: [OrderStatus.CANCELED] },
      },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    const totalRevenue = orders.reduce((acc, o) => acc + Number(o.total), 0);
    const totalOrders = orders.length;
    const avgTicket = totalOrders ? totalRevenue / totalOrders : 0;

    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="relatorio-pedidos-${formatDate(startDate).replace(/\//g, '-')}.pdf"`);
    doc.pipe(res);

    // Header
    doc.rect(0, 0, 595, 80).fill(PINK);
    doc.fillColor(GOLD).fontSize(22).font('Helvetica-Bold').text('Raio de Luz', 50, 22);
    doc.fontSize(10).font('Helvetica').text('✦ Moda Feminina — Relatório de Pedidos', 50, 50);

    // Period
    doc.fillColor(DARK).fontSize(14).font('Helvetica-Bold').text('Relatório de Pedidos', 50, 100);
    doc.fillColor(GRAY).fontSize(10).font('Helvetica').text(`Período: ${formatDate(startDate)} a ${formatDate(endDate)}`, 50, 118);
    doc.text(`Gerado em: ${formatDate(new Date())}`, 50, 132);

    // Summary cards
    doc.rect(50, 155, 155, 60).fillAndStroke('#fdf5f7', '#f0e0e4');
    doc.fillColor(PINK).fontSize(8).font('Helvetica-Bold').text('TOTAL DE PEDIDOS', 60, 165);
    doc.fillColor(DARK).fontSize(22).font('Helvetica-Bold').text(totalOrders.toString(), 60, 178);

    doc.rect(215, 155, 155, 60).fillAndStroke('#fdf5f7', '#f0e0e4');
    doc.fillColor(PINK).fontSize(8).font('Helvetica-Bold').text('RECEITA TOTAL', 225, 165);
    doc.fillColor(DARK).fontSize(18).font('Helvetica-Bold').text(formatCurrency(totalRevenue), 225, 180);

    doc.rect(380, 155, 155, 60).fillAndStroke('#fdf5f7', '#f0e0e4');
    doc.fillColor(PINK).fontSize(8).font('Helvetica-Bold').text('TICKET MÉDIO', 390, 165);
    doc.fillColor(DARK).fontSize(18).font('Helvetica-Bold').text(formatCurrency(avgTicket), 390, 180);

    // Table header
    doc.rect(50, 235, 495, 24).fill(DARK);
    doc.fillColor('#fff').fontSize(9).font('Helvetica-Bold');
    doc.text('PEDIDO', 60, 243);
    doc.text('DATA', 130, 243);
    doc.text('CLIENTE', 195, 243);
    doc.text('STATUS', 345, 243);
    doc.text('TOTAL', 445, 243, { align: 'right', width: 90 });

    const statusLabel: Record<string, string> = {
      PENDING: 'Pendente', CONFIRMED: 'Confirmado', PAID: 'Pago',
      PREPARING: 'Preparando', SHIPPED: 'Enviado', DELIVERED: 'Entregue',
    };

    let y = 259;
    orders.forEach((order, i) => {
      if (y > 730) { doc.addPage(); y = 60; }
      if (i % 2 === 0) doc.rect(50, y - 4, 495, 20).fill('#fdf5f7');
      doc.fillColor(DARK).fontSize(8).font('Helvetica');
      doc.text(`#${order.id.slice(-8).toUpperCase()}`, 60, y);
      doc.text(formatDate(order.createdAt), 130, y);
      doc.text(order.customerName.substring(0, 22), 195, y);
      doc.text(statusLabel[order.status] || order.status, 345, y);
      doc.text(formatCurrency(Number(order.total)), 445, y, { align: 'right', width: 90 });
      y += 20;
    });

    // Footer
    doc.rect(0, 800, 595, 42).fill(DARK);
    doc.fillColor(GOLD).fontSize(8).text('Raio de Luz — Moda Feminina', 50, 815, { align: 'center', width: 495 });

    doc.end();
  }

  async generateProductsReport(res: Response) {
    const products = await prisma.product.findMany({
      include: { category: true, variants: true, _count: { select: { orderItems: true, favorites: true } } },
      orderBy: { totalSold: 'desc' },
    });

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="relatorio-produtos-${Date.now()}.pdf"`);
    doc.pipe(res);

    doc.rect(0, 0, 595, 80).fill(PINK);
    doc.fillColor(GOLD).fontSize(22).font('Helvetica-Bold').text('Raio de Luz', 50, 22);
    doc.fontSize(10).font('Helvetica').text('✦ Moda Feminina — Relatório de Produtos', 50, 50);

    doc.fillColor(DARK).fontSize(14).font('Helvetica-Bold').text('Relatório de Produtos', 50, 100);
    doc.fillColor(GRAY).fontSize(10).font('Helvetica').text(`Gerado em: ${formatDate(new Date())}`, 50, 118);

    // Table
    doc.rect(50, 140, 495, 24).fill(DARK);
    doc.fillColor('#fff').fontSize(8).font('Helvetica-Bold');
    doc.text('PRODUTO', 60, 148);
    doc.text('CATEGORIA', 220, 148);
    doc.text('PREÇO', 320, 148);
    doc.text('VENDAS', 390, 148);
    doc.text('ESTOQUE', 450, 148);

    let y = 164;
    products.forEach((p, i) => {
      if (y > 730) { doc.addPage(); y = 60; }
      if (i % 2 === 0) doc.rect(50, y - 4, 495, 20).fill('#fdf5f7');
      const stock = p.variants.reduce((acc, v) => acc + v.stock, 0);
      doc.fillColor(DARK).fontSize(8).font('Helvetica');
      doc.text(p.name.substring(0, 28), 60, y);
      doc.text(p.category?.name || '—', 220, y);
      doc.text(formatCurrency(Number(p.basePrice)), 320, y);
      doc.text(p.totalSold.toString(), 390, y);
      doc.fillColor(stock === 0 ? PINK : DARK).text(stock.toString(), 450, y);
      y += 20;
    });

    doc.rect(0, 800, 595, 42).fill(DARK);
    doc.fillColor(GOLD).fontSize(8).text('Raio de Luz — Moda Feminina', 50, 815, { align: 'center', width: 495 });
    doc.end();
  }
}

export const reportsService = new ReportsService();