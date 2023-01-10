FROM node:18

WORKDIR /var/movable/microservice
COPY ./ /var/movable/microservice

RUN echo "installing dependencies root" && npm install && npm install -g typescript@latest

WORKDIR /var/movable/microservice
RUN echo "installing dependencies in backend" && npm install

WORKDIR /var/movable/microservice
RUN echo "compiling typescript in backend" && tsc
CMD node ./dist/index.js