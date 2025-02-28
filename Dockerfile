# Base image with Node.js
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files, source code, and metadata
COPY . .

# Install dependencies, build TypeScript, and prune dev dependencies
RUN npm ci && \
    npm run build && \
    npm prune --production

# Set executable permissions for the entry point
RUN chmod +x ./build/index.js

# Set the entry point
ENTRYPOINT ["node", "build/index.js"]
