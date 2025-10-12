# Multi-stage Dockerfile for Startup Service (TypeScript monorepo)

FROM node:20-alpine AS deps
WORKDIR /usr/src/app
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json* ./
COPY services/startup-service/package.json ./services/startup-service/package.json
COPY startup-platform/shared/types/package.json ./startup-platform/shared/types/package.json
COPY shared/types/package.json ./shared/types/package.json

COPY . .
RUN npm ci --omit=dev --legacy-peer-deps
RUN npm run --workspace @startup-platform/startup-service build

FROM node:20-alpine AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=deps /usr/src/app/services/startup-service/dist ./services/startup-service/dist
COPY --from=deps /usr/src/app/services/startup-service/package.json ./services/startup-service/package.json

EXPOSE 3001
CMD ["node", "services/startup-service/dist/index.js"]
