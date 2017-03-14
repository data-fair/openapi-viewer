FROM node:7.4.0-alpine

RUN npm install -g yarn

ENV NODE_ENV production
WORKDIR /webapp
ADD package.json /webapp/package.json
ADD yarn.lock /webapp/yarn.lock
RUN yarn

# Adding UI files
ADD public /webapp/public

# Adding server files
ADD server /webapp/server
ADD config /webapp/config

VOLUME /webapp/resources
EXPOSE 8080

CMD ["node", "server/app.js"]
