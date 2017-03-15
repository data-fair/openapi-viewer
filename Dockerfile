FROM node:7.4.0-alpine
MAINTAINER "contact@koumoul.com"

RUN npm install -g yarn

WORKDIR /webapp
VOLUME /webapp/resources
ADD webpack.config.js /webapp/webpack.config.js
ADD .babelrc /webapp/.babelrc

# Adding server files
ADD server /webapp/server
ADD config /webapp/config
EXPOSE 8080

ADD package.json /webapp/package.json
ADD yarn.lock /webapp/yarn.lock

# Adding UI files and building bundle
ADD public /webapp/public
RUN yarn && npm run build && yarn install --production && yarn cache clean

ENV NODE_ENV production

CMD ["node", "server/app.js"]
