FROM node:18-bullseye

# Install global dependencies
RUN npm install -g firebase-tools@13.16.0

# Set the working directory
WORKDIR /workspace

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install project dependencies
RUN npm ci

# Copy the rest of the project
COPY . .

# Create a non-root user
RUN groupadd --gid 1000 node \
    && usermod --uid 1000 --gid 1000 node \
    && chown -R node:node /workspace

# Switch to non-root user
USER node

# Expose ports for development
EXPOSE 5173 9000 9001 9002 9003 9004 9005 9006 9007 9008 9009 9010

# Default command
CMD ["npm", "start"] 