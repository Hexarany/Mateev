# Single-stage build with explicit file copying
# CRITICAL: Do NOT use COPY . . as it may copy dist folders
FROM node:20-alpine

WORKDIR /app

# Copy only necessary files (explicitly exclude dist folders)
COPY package*.json ./
COPY client/package*.json ./client/
COPY client/src ./client/src
COPY client/public ./client/public
COPY client/index.html ./client/
COPY client/vite.config.ts ./client/
COPY client/tsconfig*.json ./client/
COPY server/package*.json ./server/
COPY server/src ./server/src
COPY server/tsconfig*.json ./server/

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
