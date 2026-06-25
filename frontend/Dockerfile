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

# Usa o template de configuração. O Nginx (imagem oficial) substitui as
# variáveis de ambiente nos arquivos em /etc/nginx/templates na inicialização
# e gera o .conf final em /etc/nginx/conf.d. Assim a porta (PORT) é dinâmica:
# o Railway injeta PORT=8080; no Docker local usamos 80 (definido abaixo).
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Porta padrão (Docker local). No Railway, a variável PORT do ambiente
# sobrescreve este valor automaticamente.
ENV PORT=80

# Faz o envsubst do Nginx substituir APENAS a variável PORT no template,
# preservando as variáveis internas do Nginx ($uri, $host, etc.).
ENV NGINX_ENVSUBST_FILTER=PORT

# Copia os arquivos buildados
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# O entrypoint padrão da imagem nginx processa os templates antes de subir
CMD ["nginx", "-g", "daemon off;"]
