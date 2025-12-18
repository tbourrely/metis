# Multi-stage Dockerfile for NestJS backend
# Builder stage
FROM node:24-alpine AS builder
WORKDIR /app

# Install build deps
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Production image
FROM node:24-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

# Install chromium and other OS deps required by puppeteer
RUN apk add --no-cache chromium nss freetype harfbuzz ttf-freefont \
  && addgroup -S pptr \
  && adduser -S -G pptr user \
  && mkdir -p /home/user && chown -R user:pptr /home/user \
  && if [ -f /usr/lib/chromium/chrome-sandbox ]; then chown root:root /usr/lib/chromium/chrome-sandbox && chmod 4755 /usr/lib/chromium/chrome-sandbox; fi
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV HOME=/home/user

# Install only production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy build artifacts
COPY --from=builder /app/dist ./dist

# Ensure the non-root user owns the app files so chromium sandbox works
RUN chown -R user:pptr /app /home/user || true

# Run as non-root 'user' so chromium can use its sandbox
USER user

EXPOSE 3000
CMD ["node", "dist/main"]
