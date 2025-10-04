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

# ---- Runner stage: only production deps and built output ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install only production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled app from builder
COPY --from=builder /app/dist ./dist

# App listens on PORT, default 8080 for Fly
ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/index.js"]
