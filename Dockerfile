# Stage 1: Dependencies
FROM node:18-bullseye-slim AS deps

# Install Oracle Instant Client dependencies
RUN apt-get update && apt-get install -y \
    libaio1 \
    wget \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Download and install Oracle Instant Client
RUN mkdir -p /opt/oracle && \
    cd /opt/oracle && \
    wget https://download.oracle.com/otn_software/linux/instantclient/2110000/instantclient-basic-linux.x64-21.10.0.0.0dbru.zip && \
    unzip instantclient-basic-linux.x64-21.10.0.0.0dbru.zip && \
    rm instantclient-basic-linux.x64-21.10.0.0.0dbru.zip

ENV LD_LIBRARY_PATH=/opt/oracle/instantclient_21_10

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Stage 2: Builder
FROM node:18-bullseye-slim AS builder

# Install Oracle Instant Client dependencies
RUN apt-get update && apt-get install -y \
    libaio1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy Oracle Instant Client from deps stage
COPY --from=deps /opt/oracle /opt/oracle
ENV LD_LIBRARY_PATH=/opt/oracle/instantclient_21_10

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Add sharp installation to handle native modules
RUN npm install sharp

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the application
RUN npm run build

# Stage 3: Runner
FROM node:18-bullseye-slim AS runner

# Install Oracle Instant Client dependencies
RUN apt-get update && apt-get install -y \
    libaio1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy Oracle Instant Client
COPY --from=deps /opt/oracle /opt/oracle
ENV LD_LIBRARY_PATH=/opt/oracle/instantclient_21_10

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set proper ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
