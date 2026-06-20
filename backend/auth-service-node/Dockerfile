# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app

# Install OpenSSL 3 for Prisma (Alpine 3.17+ uses OpenSSL 3)
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine
WORKDIR /app

# Install OpenSSL 3 for Prisma
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci --only=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma
EXPOSE 3001
CMD ["npm", "start"]
