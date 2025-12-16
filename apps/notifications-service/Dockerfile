FROM node:20-alpine AS development

WORKDIR /app

# Instalar wget para healthchecks
RUN apk add --no-cache wget

COPY package*.json turbo.json ./
COPY . .

RUN npm install

EXPOSE 3004

CMD ["npm", "run", "dev", "--workspace=@challenge/notifications-service"]