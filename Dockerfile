# Stage 1: Dependencies
FROM node:20-alpine AS deps

WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Stage 2: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
RUN yarn build

# Stage 3: Production runtime
FROM node:20-alpine AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3000
ENV PORT=3000

CMD ["node_modules/.bin/next", "start"]
