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

# Build the Nodejs app
RUN npm run build

# Make the startup script executable
COPY start.sh /usr/src/app/start.sh
RUN chmod +x start.sh

# Start the server using the script
CMD ["/usr/src/app/start.sh"]