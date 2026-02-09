# UmrahOS Production Dockerfile
# Optimized for Railway.app or Render.com

# 1. Base image with Playwright (Browser dependencies included)
FROM mcr.microsoft.com/playwright:v1.49.1-noble

# 2. Setup Working Directory
WORKDIR /app

# 3. Cache dependencies
COPY package*.json ./
RUN npm install

# 4. Copy source and build with verification
COPY . .
RUN npm run build && \
    echo "=== Build Verification ===" && \
    ls -la /app/dist/ && \
    echo "--- Client artifacts ---" && \
    ls -la /app/dist/public/ && \
    echo "--- Server artifacts ---" && \
    ls -la /app/dist/server/ && \
    echo "--- Checking required files ---" && \
    [ -f /app/dist/public/index.html ] && echo "✓ Client build SUCCESS" || (echo "✗ Client build FAILED" && exit 1) && \
    [ -f /app/dist/server/index.js ] && echo "✓ Server build SUCCESS" || (echo "✗ Server build FAILED" && exit 1)

# 5. Production Environment
ENV NODE_ENV=production
ENV PORT=5000

# 6. Expose the application port
EXPOSE 5000

# 7. Start the application
# Use start:prod which runs node dist/server/index.js
CMD ["npm", "run", "start:prod"]
