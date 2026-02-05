# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Serve stage - using a lightweight server to serve static files
FROM node:18-alpine AS runner

WORKDIR /app

# Install a simple static file server
RUN npm install -g serve

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

# Expose port 8080 (Cloud Run expectation)
EXPOSE 8080

# Command to run the server
CMD ["serve", "-s", "dist", "-l", "8080"]
