FROM node:latest
RUN mkdir ./app
WORKDIR /app
COPY ./package.json .
RUN npm install
COPY ./build ./app


CMD ["node", "./index.js"]