FROM node:18.17-alpine

WORKDIR /app

RUN addgroup --system backend && \
  adduser --system -G backend backend

COPY dist/packages/backend backend
RUN chown -R backend:backend .

# You can remove this install step if you build with `--bundle` option.
# The bundled output will include external dependencies.
RUN npm --prefix backend install

COPY packages/prisma/prisma/schema.prisma backend/schema.prisma

WORKDIR /app/backend
ENV PRISMA_JS_CLIENT_PATH=./node_modules/.prisma/client
RUN npx prisma generate --generator=client --schema="./schema.prisma"

ENTRYPOINT npx prisma db push --skip-generate --schema="./schema.prisma" && node main.js