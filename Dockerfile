# Single-stage build (no cache issues)
FROM node:20-alpine

WORKDIR /app

# Copy everything
COPY . .

# Build client FIRST
WORKDIR /app/client
RUN npm install --legacy-peer-deps
RUN npm run build

# Build server
WORKDIR /app/server
RUN npm install --legacy-peer-deps
RUN npm run build

# Remove dev dependencies
WORKDIR /app/client
RUN npm prune --production

WORKDIR /app/server
RUN npm prune --production

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
