# Install dependencies only
FROM node:20-alpine AS deps
WORKDIR /app

# Install OS packages required for some packages
RUN apk add --no-cache libc6-compat

# Install node_modules
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Build the app
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

# Final production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy only necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.ts ./next.config.ts


EXPOSE 3000
CMD ["yarn", "start"]
