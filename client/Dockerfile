# Frontend Dockerfile — Development
FROM node:20-alpine

WORKDIR /app

# Install dependencies first (layer caching)
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start Vite dev server, binding to 0.0.0.0 so it is reachable from the host
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
