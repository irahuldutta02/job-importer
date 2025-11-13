# Use Node.js LTS version
FROM node:20-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Create a non-root user early
RUN addgroup -g 1001 -S nodejs && \
  adduser -S nextjs -u 1001

# Set working directory and change ownership
WORKDIR /app
RUN chown nextjs:nodejs /app

# Switch to non-root user for subsequent operations
USER nextjs

# Copy package files
COPY --chown=nextjs:nodejs package*.json ./

# Install dependencies
RUN npm ci

# Copy source code with correct ownership
COPY --chown=nextjs:nodejs . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

# Start the application
CMD ["npm", "start"]