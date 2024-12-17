FROM node:22.12.0-alpine3.21 AS base
RUN npm i -g npm@10.9 && npm cache clean --force && rm -rf /tmp/node-compile-cache

FROM base AS builder

WORKDIR /webapp
COPY webpack.config.js webpack.config.js
COPY .babelrc .babelrc

COPY package.json .
COPY package-lock.json .
RUN npm ci

# Adding UI files and building bundle
COPY public public
RUN NODE_ENV=production npm run build

FROM builder AS intermediate

COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm ci --omit=dev

####################
FROM base AS final
LABEL maintainer="contact@koumoul.com"
ENV NODE_ENV=production

WORKDIR /webapp

COPY README.md .
COPY config config
COPY server server

COPY --from=builder /webapp/public/index.html public/index.html
COPY --from=builder /webapp/public/assets/ public/assets/
COPY --from=builder /webapp/public/bundles/ public/bundles/

COPY --from=intermediate /webapp/node_modules node_modules

COPY VERSION.json* ./

EXPOSE 8080
CMD ["node", "--max-http-header-size", "64000", "server/app.js"]
