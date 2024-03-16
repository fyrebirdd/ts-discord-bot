FROM node:latest
RUN mkdir ./app
WORKDIR ./app
COPY ./package.json .
RUN npm install
COPY ./build .

CMD ["node", "index.js"]