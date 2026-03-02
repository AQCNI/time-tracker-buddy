# Stage 1: build application
FROM node:18-alpine AS builder

# set working directory
WORKDIR /app

# install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# copy source code
COPY . .

# build for production
RUN npm run build

# Stage 2: serve with nginx
FROM nginx:alpine

# copy build output
COPY --from=builder /app/dist /usr/share/nginx/html

# expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
