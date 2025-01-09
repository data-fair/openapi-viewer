# =============================
# Base Node image
# =============================
FROM node:22.9.0-alpine3.20 AS base

WORKDIR /app
ENV NODE_ENV=production

# =============================
# Package preparation (stripping version for caching)
# =============================
FROM base AS package-strip

RUN apk add --no-cache jq moreutils
ADD package.json package-lock.json ./
# remove version from manifest for better caching when building a release
RUN jq '.version="build"' package.json | sponge package.json
RUN jq '.version="build"' package-lock.json | sponge package-lock.json

# =============================
# Full dependencies installation (for types and building)
# =============================
FROM base AS installer

RUN apk add --no-cache python3 make g++ git jq moreutils
RUN npm i -g clean-modules@3.0.4
COPY --from=package-strip /app/package.json package.json
COPY --from=package-strip /app/package-lock.json package-lock.json
COPY ui/package.json ui/package.json
COPY api/package.json api/package.json
# full deps install used for types and ui building
# also used to fill the npm cache for faster install api deps
RUN npm ci --omit=dev --omit=optional --omit=peer --no-audit --no-fund

# =============================
# Build Types for API
# =============================
FROM installer AS types

COPY api/config api/config
RUN npm run build-types

# =============================
# Build UI with Vite
# =============================
FROM installer AS ui

RUN npm i --no-save @rollup/rollup-linux-x64-musl
COPY --from=types /app/api/config api/config
ADD /api/src/config.ts api/src/config.ts
ADD /ui ui
RUN npm -w ui run build

# =============================
# Install production dependencies for API
# =============================
FROM installer AS api-installer

# remove other workspaces and reinstall, otherwise we can get rig have some peer dependencies from other workspaces
RUN npm ci -w api --prefer-offline --omit=dev --omit=optional --omit=peer --no-audit --no-fund && \
    npx clean-modules --yes
RUN mkdir -p /app/api/node_modules

# =============================
# Final API Image
# =============================
FROM base AS main

COPY --from=api-installer /app/node_modules node_modules
COPY api api
COPY --from=types /app/api/config api/config
COPY --from=api-installer /app/api/node_modules api/node_modules
COPY --from=ui /app/ui/dist ui/dist
COPY package.json README.md BUILD.json* ./
EXPOSE 8080
EXPOSE 9090
# USER node # This would be great to use, but not possible as the volumes are mounted as root
WORKDIR /app/api
CMD ["node", "--max-http-header-size", "64000", "--experimental-strip-types", "index.ts"]
