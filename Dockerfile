FROM node:24-alpine AS build
WORKDIR /app
COPY --link package.json package-lock.json ./
RUN npm ci
COPY --link . .
RUN npm run build

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --link --from=build /app/.output ./.output
USER node
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
