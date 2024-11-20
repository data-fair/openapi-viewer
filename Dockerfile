FROM node:20.18.0-alpine3.20
MAINTAINER "contact@koumoul.com"

WORKDIR /webapp
COPY webpack.config.js webpack.config.js
COPY .babelrc .babelrc

# Adding server files
COPY server server
COPY config config

COPY package.json package.json
COPY package-lock.json package-lock.json

# Adding UI files and building bundle
COPY public public
RUN npm ci && NODE_ENV=production npm run build && npm prune --production && rm -rf public/src

COPY README.md VERSION.json* ./

ENV NODE_ENV production
EXPOSE 8080

CMD ["node", "--max-http-header-size", "64000", "server/app.js"]
