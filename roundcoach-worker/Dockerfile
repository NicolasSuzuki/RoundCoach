FROM node:20-alpine AS base
WORKDIR /app

COPY package.json ./
RUN npm install

COPY tsconfig.json eslint.config.mjs ./
COPY src ./src

RUN npm run build

EXPOSE 3002

CMD ["npm", "start"]
