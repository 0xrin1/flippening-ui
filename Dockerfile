FROM node:14-alpine3.14

EXPOSE 3000

WORKDIR /app

COPY . /app

RUN npm install

ENTRYPOINT ["node_modules/.bin/next"]