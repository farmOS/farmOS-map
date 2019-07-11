# Inherit from the official node.js image.
FROM node

# Set the working directory to /usr/src/app.
WORKDIR /usr/src/app

# Install dependencies.
COPY package.json package.json
RUN npm install

# Copy source files needed for running npm build.
COPY src/ .
COPY static/ ./static
