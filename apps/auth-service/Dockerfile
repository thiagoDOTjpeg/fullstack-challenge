FROM node:20-alpine AS development

WORKDIR /app

COPY package*.json turbo.json ./
COPY . .

RUN npm install

EXPOSE 3002

CMD ["npm", "run", "dev", "--workspace=@challenge/auth-service"]