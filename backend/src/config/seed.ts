import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Gera slug a partir do nome
const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

async function main() {
  console.log('🌱 Iniciando seed da Raio de Luz...');

  // ---- Usuário admin (vem de variáveis de ambiente) ----
  // Defina ADMIN_EMAIL e ADMIN_PASSWORD no .env (ou no painel do Railway).
  // Se não definir, usa valores padrão APENAS para desenvolvimento local.
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@raiodeluz.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const adminName = process.env.ADMIN_NAME || 'Administradora';

  if (!process.env.ADMIN_PASSWORD) {
    console.warn('⚠️  ADMIN_PASSWORD não definida — usando senha padrão de desenvolvimento. NÃO use assim em produção!');
  }

  // Só cria o admin se ainda não existir (seguro rodar várias vezes)
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existingAdmin) {
    console.log(`✦ Admin já existe (${adminEmail}) — nada a fazer.`);
  } else {
    const hashed = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        password: hashed,
        role: 'ADMIN',
      },
    });
    console.log(`✦ Admin criado: ${adminEmail}`);
  }

  // ---- Categorias ----
  // Cria as categorias da loja se ainda não existirem (não apaga nada).
  const categoriasData = [
    { name: 'Vestidos', description: 'Do casual ao festa, peças que valorizam você.', sortOrder: 1 },
    { name: 'Blusas', description: 'Blusas e camisas para todos os momentos.', sortOrder: 2 },
    { name: 'Saias', description: 'Saias modernas e versáteis.', sortOrder: 3 },
    { name: 'Calças', description: 'Conforto e estilo do dia a dia ao trabalho.', sortOrder: 4 },
    { name: 'Conjuntos', description: 'Looks completos pensados para você.', sortOrder: 5 },
    { name: 'Calçados', description: 'Sapatos, sandálias e tênis para completar o look.', sortOrder: 6 },
    { name: 'Acessórios', description: 'Os detalhes que fazem a diferença.', sortOrder: 7 },
  ];

  let categoriasCriadas = 0;
  for (const cat of categoriasData) {
    const slug = slugify(cat.name);
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (!existing) {
      await prisma.category.create({
        data: { ...cat, slug, active: true },
      });
      categoriasCriadas++;
    }
  }
  console.log(`✦ ${categoriasCriadas} categorias criadas (${categoriasData.length - categoriasCriadas} já existiam)`);

  console.log('✅ Seed concluído!');
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
