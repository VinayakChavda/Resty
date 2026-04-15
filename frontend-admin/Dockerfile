# Stage 1: Build Angular
FROM node:20-slim AS build
WORKDIR /app

# Copy package files first to cache them
COPY package*.json ./

# Install dependencies (Cleanly)
RUN npm install --legacy-peer-deps

# Copy the rest of your code (Docker will now ignore node_modules because of our .dockerignore file)
COPY . .

# Build the project
RUN npm run build --configuration=production

# Stage 2: Serve with Nginx
FROM nginx:alpine

# NOTE: In newer Angular versions (17+), the output goes to 'dist/frontend-admin/browser'
# Check your local 'dist' folder. If there is a 'browser' folder, use the path below:
COPY --from=build /app/dist/frontend-admin/browser /usr/share/nginx/html

# If your Angular version is older and doesn't have a /browser folder, use this instead:
# COPY --from=build /app/dist/frontend-admin /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80