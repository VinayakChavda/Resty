# Stage 1: Build Angular
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build --configuration=production

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/dist/frontend-admin /usr/share/nginx/html
# You will need a custom nginx config to handle Angular routing
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80