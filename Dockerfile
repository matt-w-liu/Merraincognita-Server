FROM node:22-alpine AS deps
WORKDIR /app

# Build context = server package root (Railway / standalone repo)
COPY package.json package-lock.json ./
COPY shared ./shared

RUN npm install

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/shared ./shared
COPY package.json package-lock.json tsconfig.json ./
COPY src ./src

RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/package.json ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/shared ./shared
COPY --from=deps /app/node_modules ./node_modules

EXPOSE 5000
CMD ["node", "dist/server.js"]
