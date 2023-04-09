FROM node:18.15-alpine

WORKDIR /app

COPY package.json /app/package.json

COPY package-lock.json /app/package-lock.json

COPY /packages/prisma/prisma/schema.prisma /app/packages/prisma/prisma/schema.prisma

RUN npm install
