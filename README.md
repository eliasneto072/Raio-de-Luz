# Raio de Luz ✦ — E-commerce de Moda Feminina

E-commerce completo da **Raio de Luz**, construído com arquitetura modular inspirada no Brás Conecta.

## ✦ Diferenciais

- **Login sem fricção** — o cliente navega, monta a sacola e só cria conta/entra na etapa de pagamento. Carrinho anônimo via `sessionId`.
- **Relatórios em PDF por período** — geração de relatórios de pedidos e produtos (admin), com filtro de datas.
- **Notificações por E-mail e WhatsApp** — confirmação de pedido, envio, entrega, com preferências por cliente.
- **Integração com WhatsApp** — botão flutuante, atendimento e opção de finalizar pedido via WhatsApp.

## ✦ Stack

| Camada    | Tecnologias |
|-----------|-------------|
| Backend   | Node.js · Express · TypeScript · Prisma · PostgreSQL · JWT · Nodemailer · PDFKit |
| Frontend  | React · Vite · TypeScript · TailwindCSS · React Router · Zustand · TanStack Query |

## ✦ Identidade visual

Derivada da logomarca:

- **Rosa** `#e02a5a` — cor primária (fundo da logo)
- **Dourado** `#fbc471` — cor de acento (letras da logo)
- **Creme** `#fdf8f3` · **Carvão** `#1f1720` — neutros
- Tipografia: **Fraunces** (display, editorial) + **Inter** (corpo)

## ✦ Estrutura do projeto

```
Raio_Luz/
├── backend/          API REST (Express + Prisma)
│   ├── prisma/       Schema do banco
│   └── src/
│       ├── modules/  auth · products · cart · orders ·
│       │             categories · notifications · reports
│       ├── middlewares/
│       ├── config/
│       └── shared/
└── frontend/         SPA (React + Vite)
    ├── public/brand/ Logo e assets da marca
    └── src/
        ├── components/layout/  Header · Footer · CartDrawer · etc.
        ├── pages/              Páginas/rotas
        ├── store/              Estado global (auth, cart)
        ├── lib/                Cliente API e helpers
        └── types/              Tipos compartilhados
```

## ✦ Variáveis de ambiente

O backend usa um arquivo `.env` (nunca versionado). Use o `backend/.env.example`
como referência das variáveis necessárias:

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | String de conexão do PostgreSQL |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | Segredo e validade do token de login |
| `SMTP_*` / `EMAIL_FROM` | Envio de e-mails (Nodemailer) |
| `WHATSAPP_*` / `STORE_WHATSAPP` | Integração WhatsApp (Evolution API) |
| `CLOUDINARY_*` | Upload de imagens (opcional) |
| `FRONTEND_URL` | URL do front (links em e-mails e CORS) |
| `NODE_ENV` / `PORT` | Ambiente e porta da API |

> ⚠️ Nunca faça commit do `.env` real. Ele já está no `.gitignore`.
> Se algum segredo vazar (ex.: em um ZIP), rotacione-o no painel do provedor.

## ✦ Como rodar

### Backend

```bash
cd backend
npm install
cp .env.example .env   # configure DATABASE_URL, SMTP, WhatsApp etc.
npm run db:migrate
npm run db:seed        # dados iniciais (opcional)
npm run dev            # http://localhost:3333
```

### Frontend

```bash
cd frontend
npm install
npm run dev            # http://localhost:5173
```

O frontend usa proxy para `/api` → `http://localhost:3333` (configurável em `vite.config.ts`).

## ✦ Roadmap de desenvolvimento

- [x] **Passo 1** — Fundação do frontend (estrutura, identidade visual, layout base, conexão com API)
- [x] **Passo 2** — Home completa (vitrine, destaques, novidades, categorias)
- [ ] **Passo 3** — Catálogo e página de produto
- [ ] **Passo 4** — Carrinho sem login
- [ ] **Passo 5** — Checkout com login só no pagamento
- [ ] **Passo 6** — Conta do cliente (pedidos, favoritos, notificações)
- [ ] **Passo 7** — Painel admin + relatórios PDF
- [ ] **Passo 8** — Integração WhatsApp no front
- [ ] **Passo 9** — Polish e responsividade

---

© Raio de Luz — Moda Feminina