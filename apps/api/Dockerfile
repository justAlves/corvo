FROM oven/bun:1.3.13-alpine

WORKDIR /app

# Install deps with caching layer
COPY package.json bun.lock ./
COPY apps/api/package.json ./apps/api/
COPY packages/typescript-config/package.json ./packages/typescript-config/

RUN bun install --frozen-lockfile

# Copy source
COPY apps/api ./apps/api
COPY packages/typescript-config ./packages/typescript-config

WORKDIR /app/apps/api

EXPOSE 3333

# Load .env if present, run migrations, then start
CMD ["sh", "-c", "bunx --bun drizzle-kit migrate && bun run src/index.ts"]
