FROM node:18
WORKDIR /app
COPY . /app

RUN npm install
RUN npx prisma generate
RUN npm run build
CMD node ./dist/index.js
