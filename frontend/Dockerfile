# ===== Frontend — Raio de Luz =====
# Multi-stage: builda a aplicação React e serve com Nginx

# ---- Estágio 1: build ----
FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# A URL da API em produção entra como argumento de build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ---- Estágio 2: servir com Nginx ----
FROM nginx:alpine AS production

# Configuração do Nginx (SPA: todas as rotas caem no index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos buildados
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
