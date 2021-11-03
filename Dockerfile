FROM node:14.18.1-alpine
MAINTAINER "contact@koumoul.com"

WORKDIR /webapp
ADD webpack.config.js webpack.config.js
ADD .babelrc .babelrc

# Adding server files
ADD server server
ADD config config

ADD package.json package.json
ADD package-lock.json package-lock.json

# Adding UI files and building bundle
ADD public public
RUN npm install && NODE_ENV=production npm run build && npm prune --production

ADD README.md VERSION.json* .

ENV NODE_ENV production
EXPOSE 8080

CMD ["node", "server/app.js"]
