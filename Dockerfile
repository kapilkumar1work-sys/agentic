FROM node:20-slim AS base

RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    libvips-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

FROM base AS dependencies

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

FROM dependencies AS build

COPY tsconfig.json ./
COPY src ./src/

RUN npm run build

FROM base AS production

ENV NODE_ENV=production

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
COPY prisma ./prisma/
COPY scripts ./scripts/

RUN chmod +x scripts/download-models.sh && ./scripts/download-models.sh

EXPOSE 3001

CMD ["node", "dist/index.js"]
