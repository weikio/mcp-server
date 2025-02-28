# Base image with Node.js
FROM node:20-alpine

# Install .NET 8 SDK
RUN apk add --no-cache \
    bash \
    icu-libs \
    krb5-libs \
    libgcc \
    libintl \
    libssl3 \
    libstdc++ \
    zlib

# Download and install .NET 8 SDK for Alpine
RUN wget https://dot.net/v1/dotnet-install.sh -O dotnet-install.sh \
    && chmod +x dotnet-install.sh \
    && ./dotnet-install.sh --channel 8.0 --install-dir /usr/share/dotnet \
    && ln -s /usr/share/dotnet/dotnet /usr/bin/dotnet \
    && rm dotnet-install.sh

# Install Weikio CLI
RUN dotnet tool install weikio-cli --global --prerelease

# Add dotnet tools to PATH
ENV PATH="${PATH}:/root/.dotnet/tools"

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
