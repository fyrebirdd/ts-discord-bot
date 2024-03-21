FROM node:latest
RUN mkdir ./app
WORKDIR ./app
COPY ./package.json .
RUN npm install --production=true
COPY ./build .

CMD ["node", "index.js"]