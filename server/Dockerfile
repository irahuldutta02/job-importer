# Use Node.js LTS version
FROM node:20-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Create a non-root user early
RUN addgroup -g 1001 -S nodejs && \
  adduser -S nodejs -u 1001

# Set working directory and change ownership
WORKDIR /app
RUN chown nodejs:nodejs /app

# Switch to non-root user for subsequent operations
USER nodejs

# Copy package files
COPY --chown=nodejs:nodejs package*.json ./

# Install dependencies
RUN npm ci

# Copy source code with correct ownership
COPY --chown=nodejs:nodejs . .

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000/api/imports/stats || exit 1

# Start the application
CMD ["npm", "start"]