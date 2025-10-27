FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci || npm i
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN npm i -g http-server
COPY --from=build /app/dist ./dist
EXPOSE 8080
CMD ["http-server", "dist", "-p", "8080", "-a", "0.0.0.0", "-c-1"]
  
