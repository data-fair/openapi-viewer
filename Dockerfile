FROM node:8.9.1-alpine
MAINTAINER "contact@koumoul.com"

WORKDIR /webapp
VOLUME /webapp/resources
ADD webpack.config.js /webapp/webpack.config.js
ADD .babelrc /webapp/.babelrc

# Adding server files
ADD server /webapp/server
ADD config /webapp/config

ADD package.json /webapp/package.json
ADD package-lock.json /webapp/package-lock.json

# Adding UI files and building bundle
ADD public /webapp/public
RUN npm install && NODE_ENV=production npm run build && npm prune --production
ENV NODE_ENV production

EXPOSE 8080

CMD ["node", "server/app.js"]
