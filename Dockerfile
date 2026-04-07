# ─────────────────────────────────────────────────────────────────────────────
# Kripa — Next.js Frontend
# Multi-stage build: deps → builder → runner (minimal production image)
# ─────────────────────────────────────────────────────────────────────────────

FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# ── Stage 1: install dependencies ────────────────────────────────────────────
FROM base AS deps
# Need libc compat for some native modules on Alpine
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ── Stage 2: build ───────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* vars are baked in at build time — pass via --build-arg
ARG NEXT_PUBLIC_WAQI_TOKEN
ENV NEXT_PUBLIC_WAQI_TOKEN=$NEXT_PUBLIC_WAQI_TOKEN

RUN npm run build

# ── Stage 3: minimal runtime image ──────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Copy only what Next.js needs to run
COPY --from=builder /app/public          ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static     ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
