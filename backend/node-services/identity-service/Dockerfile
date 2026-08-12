FROM node:22.23.1-bookworm-slim

# Install build essentials required to compile native C++ modules like bcrypt
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Copy dependency definitions
COPY package*.json ./
COPY prisma ./prisma/

# Force npm to compile native modules directly inside this Linux environment
RUN npm ci

# Generate Prisma client specifically for this container container environment
RUN npx prisma generate

# Copy the rest of the application source
COPY . .

# Build the application
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]