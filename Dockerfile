# ---- Build stage ----
FROM node:22-alpine AS build
WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable

# Copy manifests first (better caching)
COPY product-performance-analyzer/package.json product-performance-analyzer/pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile || pnpm install

# Copy the rest of the app
COPY product-performance-analyzer/ ./

# Build (Vite typically outputs /dist)
RUN pnpm run build

# ---- Runtime stage ----
FROM node:22-alpine
WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist ./dist

EXPOSE 8080
CMD ["serve", "-s", "dist", "-l", "8080"]
