# Base image
FROM node:22-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Use npm ci for a clean, deterministic install based on package-lock.json
RUN npm ci

# Copy the rest of the application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the NestJS app
RUN npm run build

# Start the server
CMD [ "npm", "run", "start:prod" ]
