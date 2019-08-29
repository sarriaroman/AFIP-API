FROM mhart/alpine-node:7
RUN mkdir -p /usr/src/afip-api
WORKDIR /usr/src/afip-api
COPY package.json /usr/src/afip-api
RUN apk --update add --virtual compile-deps \
  g++ gcc libgcc libstdc++ linux-headers make python libressl-dev git && \
  apk --update add libressl && \
  npm install --quiet && \
  apk del compile-deps
COPY . /usr/src/afip-api
EXPOSE 3000
CMD ["npm", "run", "dev"]
