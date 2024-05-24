FROM node:latest
RUN mkdir ./app
WORKDIR ./app
COPY ./package.json .
RUN npm install --omit=dev
COPY ./build .

CMD ["node", "index.js"]