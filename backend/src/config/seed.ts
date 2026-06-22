import { PrismaClient, ProductStatus } from '@prisma/client';
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

  // ---- Limpa dados antigos (ordem respeita as foreign keys) ----
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.order.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  // ---- Usuário admin ----
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      name: 'Administradora',
      email: 'admin@raiodeluz.com',
      password: adminPassword,
      role: 'ADMIN',
      notifyEmail: true,
    },
  });
  console.log('✦ Admin criado: admin@raiodeluz.com / admin123');

  // ---- Categorias ----
  const categoriasData = [
    { name: 'Vestidos', description: 'Do casual ao festa, peças que valorizam você.', sortOrder: 1 },
    { name: 'Blusas', description: 'Blusas e camisas para todos os momentos.', sortOrder: 2 },
    { name: 'Saias', description: 'Saias modernas e versáteis.', sortOrder: 3 },
    { name: 'Calças', description: 'Conforto e estilo do dia a dia ao trabalho.', sortOrder: 4 },
    { name: 'Conjuntos', description: 'Looks completos pensados para você.', sortOrder: 5 },
    { name: 'Calçados', description: 'Sapatos, sandálias e tênis para completar o look.', sortOrder: 6 },
    { name: 'Acessórios', description: 'Os detalhes que fazem a diferença.', sortOrder: 7 },
  ];

  const categorias: Record<string, string> = {};
  for (const cat of categoriasData) {
    const created = await prisma.category.create({
      data: { ...cat, slug: slugify(cat.name), active: true },
    });
    categorias[cat.name] = created.id;
  }
  console.log(`✦ ${categoriasData.length} categorias criadas`);

  // ---- Produtos ----
  // Cada produto tem variantes (tamanho/cor). Imagens usam placeholders.
  const img = (seed: string) =>
    `https://placehold.co/600x800/e02a5a/fbc471?text=${encodeURIComponent(seed)}`;

  const produtosData = [
    {
      categoria: 'Vestidos',
      name: 'Vestido Midi Solar',
      description: 'Vestido midi de tecido fluido, perfeito para dias quentes.',
      details: 'Composição: 100% viscose. Lavar à mão.',
      basePrice: 189.9,
      salePrice: 149.9,
      isFeatured: true,
      isNew: true,
      sizes: ['P', 'M', 'G'],
      colors: ['Rosa', 'Off-white'],
    },
    {
      categoria: 'Vestidos',
      name: 'Vestido Longo Aurora',
      description: 'Vestido longo com fenda sutil e caimento elegante.',
      details: 'Composição: 95% poliéster, 5% elastano.',
      basePrice: 279.9,
      isFeatured: true,
      isNew: true,
      sizes: ['P', 'M', 'G', 'GG'],
      colors: ['Vinho', 'Preto'],
    },
    {
      categoria: 'Blusas',
      name: 'Blusa Cropped Brilho',
      description: 'Cropped de alça fina com acabamento acetinado.',
      details: 'Composição: 100% poliéster.',
      basePrice: 89.9,
      salePrice: 69.9,
      isFeatured: true,
      isNew: false,
      sizes: ['PP', 'P', 'M', 'G'],
      colors: ['Dourado', 'Rosa'],
    },
    {
      categoria: 'Blusas',
      name: 'Camisa Linho Sereno',
      description: 'Camisa de linho leve e respirável para o verão.',
      details: 'Composição: 70% linho, 30% algodão.',
      basePrice: 139.9,
      isFeatured: false,
      isNew: true,
      sizes: ['P', 'M', 'G'],
      colors: ['Branco', 'Areia'],
    },
    {
      categoria: 'Saias',
      name: 'Saia Plissada Luar',
      description: 'Saia midi plissada com cintura alta.',
      details: 'Composição: 100% poliéster.',
      basePrice: 119.9,
      isFeatured: true,
      isNew: true,
      sizes: ['P', 'M', 'G'],
      colors: ['Rosa', 'Preto'],
    },
    {
      categoria: 'Saias',
      name: 'Saia Jeans Essencial',
      description: 'Saia jeans de cintura alta, peça curinga do guarda-roupa.',
      details: 'Composição: 98% algodão, 2% elastano.',
      basePrice: 99.9,
      salePrice: 79.9,
      isFeatured: false,
      isNew: false,
      sizes: ['36', '38', '40', '42'],
      colors: ['Azul claro', 'Azul escuro'],
    },
    {
      categoria: 'Calças',
      name: 'Calça Pantalona Fluida',
      description: 'Pantalona de caimento fluido e cintura alta.',
      details: 'Composição: 100% viscose.',
      basePrice: 169.9,
      isFeatured: true,
      isNew: true,
      sizes: ['36', '38', '40', '42', '44'],
      colors: ['Bege', 'Preto'],
    },
    {
      categoria: 'Conjuntos',
      name: 'Conjunto Alfaiataria Lux',
      description: 'Blazer e calça de alfaiataria, look poderoso para o trabalho.',
      details: 'Composição: 64% poliéster, 33% viscose, 3% elastano.',
      basePrice: 349.9,
      salePrice: 299.9,
      isFeatured: true,
      isNew: true,
      sizes: ['P', 'M', 'G'],
      colors: ['Rosa', 'Off-white'],
    },
    {
      categoria: 'Conjuntos',
      name: 'Conjunto Tricô Aconchego',
      description: 'Conjunto de tricô macio, blusa e shorts combinando.',
      details: 'Composição: 50% algodão, 50% acrílico.',
      basePrice: 199.9,
      isFeatured: false,
      isNew: true,
      sizes: ['Único'],
      colors: ['Caramelo', 'Rosa'],
    },
    {
      categoria: 'Acessórios',
      name: 'Bolsa Estrela Mini',
      description: 'Bolsa transversal pequena com fecho dourado.',
      details: 'Material: couro sintético.',
      basePrice: 129.9,
      isFeatured: true,
      isNew: false,
      sizes: ['Único'],
      colors: ['Rosa', 'Dourado'],
    },
    {
      categoria: 'Acessórios',
      name: 'Lenço Seda Brilho',
      description: 'Lenço de seda estampado, versátil para vários looks.',
      details: 'Composição: 100% seda.',
      basePrice: 59.9,
      salePrice: 44.9,
      isFeatured: false,
      isNew: true,
      sizes: ['Único'],
      colors: ['Estampa rosa', 'Estampa dourada'],
    },
    {
      categoria: 'Vestidos',
      name: 'Vestido Chemise Clássico',
      description: 'Vestido chemise com cinto, elegância atemporal.',
      details: 'Composição: 100% viscose.',
      basePrice: 179.9,
      isFeatured: false,
      isNew: true,
      sizes: ['P', 'M', 'G', 'GG'],
      colors: ['Verde', 'Preto'],
    },
  ];

  let count = 0;
  for (const p of produtosData) {
    // Monta as variantes combinando cor × tamanho
    const variants = p.colors.flatMap((color) =>
      p.sizes.map((size) => ({
        color,
        size,
        sku: `${slugify(p.name)}-${slugify(color)}-${slugify(size)}`,
        price: p.salePrice ?? p.basePrice,
        stock: Math.floor(Math.random() * 20) + 5,
      }))
    );

    await prisma.product.create({
      data: {
        name: p.name,
        slug: slugify(p.name),
        description: p.description,
        details: p.details,
        status: ProductStatus.ACTIVE,
        basePrice: p.basePrice,
        salePrice: p.salePrice ?? null,
        isFeatured: p.isFeatured,
        isNew: p.isNew,
        coverImage: img(p.name),
        categoryId: categorias[p.categoria],
        totalSold: Math.floor(Math.random() * 50),
        images: {
          create: [
            { imageUrl: img(p.name), alt: p.name, position: 0 },
            { imageUrl: img(p.name + ' 2'), alt: p.name, position: 1 },
          ],
        },
        variants: { create: variants },
      },
    });
    count++;
  }
  console.log(`✦ ${count} produtos criados (com variantes e imagens)`);

  // ---- Cupom de exemplo ----
  await prisma.coupon.create({
    data: {
      code: 'BEMVINDA10',
      description: '10% de desconto na primeira compra',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderValue: 100,
      active: true,
    },
  });
  console.log('✦ Cupom BEMVINDA10 criado');

  console.log('✅ Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });