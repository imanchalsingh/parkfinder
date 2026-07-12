# Backend Dockerfile — Development
FROM node:20-alpine

WORKDIR /app

# Install dependencies first (layer caching)
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose Express server port
EXPOSE 5000

# Start server with nodemon for hot reloading
CMD ["npm", "run", "dev"]
