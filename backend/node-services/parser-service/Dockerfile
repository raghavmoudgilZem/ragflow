# Base image
FROM node:22-alpine

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Run Prisma Generate and build the NestJS app
RUN npm run prisma:generate && npm run build

# Start the server
CMD [ "npm", "run", "start:prod" ]
