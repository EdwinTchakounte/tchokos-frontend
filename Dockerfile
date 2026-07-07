# ==========================================================================
#  Tchokos — image frontend (Next.js 16, sortie standalone) pour le VPS.
#  ⚠ Les variables NEXT_PUBLIC_* sont figées au BUILD (injectées via
#     --build-arg par la CI). Elles doivent viser les domaines de PROD.
#  Le serveur écoute sur 0.0.0.0:3000 (joignable par le nginx central).
# ==========================================================================

# ---- deps : dépendances (cache) ----
FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder : build Next avec les URLs publiques de prod ----
FROM node:22-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_API_URL=https://api.tchokos-sarl.com
ARG NEXT_PUBLIC_SITE_URL=https://tchokos-sarl.com
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- runner : image finale minimale ----
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1
RUN useradd --create-home --uid 1001 nextjs

# Sortie standalone : server.js + node_modules minimal + public + static
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
