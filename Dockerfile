# Base image with Node.js
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code and built files
COPY build/ ./build/
COPY metadata/ ./metadata/

# Set executable permissions for the entry point
RUN chmod +x ./build/index.js

# Set the entry point
ENTRYPOINT ["node", "build/index.js"]
