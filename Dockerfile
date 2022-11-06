FROM node:18-slim

RUN apt-get update
RUN apt-get install -y openssl

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

CMD NODE_ENV=production node ./dist/index.js
