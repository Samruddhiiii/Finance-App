# syntax=docker/dockerfile:1

# --- deps ---
FROM node:20-bookworm-slim AS deps
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
RUN npm ci


# --- builder ---
FROM node:20-bookworm-slim AS builder
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install OpenSSL (required for Prisma)
RUN apt-get update && apt-get install -y openssl

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy Prisma FIRST (important)
COPY prisma ./prisma

# Copy rest of the app
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js app
RUN npm run build


# --- runner ---
FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# Install OpenSSL again for runtime
RUN apt-get update && apt-get install -y openssl

# Create non-root user (Debian compatible)
RUN groupadd -r nextjs && useradd -r -g nextjs nextjs

# Copy only required files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/prisma ./prisma

# Use non-root user
USER nextjs

EXPOSE 3000

# Run DB migrations + start app
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
