# Source: Markus Oberlehner, https://markus.oberlehner.net/blog/running-nuxt-3-in-a-docker-container

ARG NODE_VERSION=20.18.0

FROM node:${NODE_VERSION}-slim as base

ARG PORT=3000

WORKDIR /src

# Build step
FROM base as build

COPY --link package.json package-lock.json .
RUN npm install

# The --link arguments tries to avoid copying the files,
# by creating a hard link for them in the filesystem instead.
# This speeds up the build and reduces storage used in the container.
COPY --link . .

RUN npm run build

# Run step
FROM base

ENV PORT=$PORT
ENV NODE_ENV=production

COPY --from=build /src/.output /src/.output

# Run web server
CMD [ "node", ".output/server/index.mjs" ]