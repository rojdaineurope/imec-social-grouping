# Node imajını kullan
FROM node:20-slim AS build

WORKDIR /app

# Bağımlılıkları yükle
COPY package*.json ./
RUN npm install

# Kodu kopyala ve build al
COPY . .
RUN npm run build

# Üretim (Production) sunucusu için Nginx kullan
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Varsayılan Nginx portu
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]