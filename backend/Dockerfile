# ===== Backend — Raio de Luz =====
# Multi-stage: compila o TypeScript e roda só o necessário em produção

# ---- Estágio 1: build ----
FROM node:20-slim AS builder

# Prisma precisa do OpenSSL
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

# Instala dependências (camada cacheável)
COPY package*.json ./
RUN npm ci

# Copia o código e gera o Prisma Client + compila o TS
COPY . .
RUN npx prisma generate
RUN npm run build

# ---- Estágio 2: produção ----
FROM node:20-slim AS production

RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

ENV NODE_ENV=production

# Só dependências de produção
COPY package*.json ./
RUN npm ci --omit=dev

# Copia o build, o Prisma Client gerado e o schema
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

EXPOSE 3333

# Aplica as migrations e inicia o servidor
CMD npx prisma migrate deploy && node dist/server.js
