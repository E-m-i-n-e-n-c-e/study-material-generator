# Multi-stage Dockerfile for Node.js + TypeScript on Fly.io

# ---- Builder stage: install dev deps and compile TS ----
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies (with dev deps for TypeScript build)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- Runner stage: Puppeteer official image (Chromium preinstalled) ----
FROM ghcr.io/puppeteer/puppeteer:latest AS runner
WORKDIR /app

# Skip Puppeteer's bundled Chromium download
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1
ENV NODE_ENV=production
ENV PORT=8080

# Install only production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled app from builder
COPY --from=builder /app/dist ./dist

# Use non-root Puppeteer user (pptruser) to avoid --no-sandbox
USER pptruser

# Expose port
EXPOSE 8080

CMD ["node", "dist/index.js"]
