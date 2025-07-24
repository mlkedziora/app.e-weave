# Builder stage (your current version is fine, but included for completeness)
FROM node:20 AS builder
WORKDIR /app
COPY package*.json prisma/schema.prisma ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

# Runtime stage
FROM node:20-slim
WORKDIR /app
# Install OpenSSL (and ca-certificates for HTTPS/TLS if needed)
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/dist ./dist
COPY package*.json prisma/schema.prisma ./
RUN npm install --production
CMD ["node", "dist/main"]