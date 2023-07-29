FROM node:18.17-alpine as builder

WORKDIR /app

RUN addgroup --system frontend && \
  adduser --system -G frontend frontend

COPY package.json package.json

COPY package-lock.json package-lock.json

RUN npm install

COPY . .

RUN npx prisma generate --schema="packages/prisma/prisma/schema.prisma"

RUN cp packages/frontend/.env.production packages/frontend/.env.local

RUN npx nx run frontend:build:production

FROM nginx:1.19.1-alpine

COPY --from=builder /app/dist/packages/frontend /usr/share/nginx/html

COPY packages/frontend/conf/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD [ "nginx", "-g", "daemon off;" ]