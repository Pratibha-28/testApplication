FROM node:11.8.0-alpine

WORKDIR /usr/src/app

CMD ["npm","run","start"]

COPY package.json  /usr/src/app/package.json
COPY package-lock.json  /usr/src/app/package-lock.json

RUN npm ci

COPY . /usr/src/app
