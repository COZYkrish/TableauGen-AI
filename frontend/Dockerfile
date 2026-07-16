# ═══════════════════════════════════════════════════════════════════════════
# TableauGen AI — Frontend Dockerfile
# ═══════════════════════════════════════════════════════════════════════════

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --frozen-lockfile

COPY . .
RUN npm run build

# ── Runtime: nginx ───────────────────────────────────────────────────────────
FROM nginx:1.25-alpine AS runtime

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s \
    CMD wget -qO- http://localhost:80/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
