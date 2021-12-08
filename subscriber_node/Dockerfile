# pull official base image
FROM node:13.12.0-alpine
RUN apk add --no-cache bash g++ ca-certificates lz4-dev musl-dev cyrus-sasl-dev openssl-dev make python
RUN apk add --no-cache --virtual .build-deps gcc zlib-dev libc-dev bsd-compat-headers py-setuptools bash

# set working directory
WORKDIR /subscriber_node

# add `/app/node_modules/.bin` to $PATH
ENV PATH /subscriber_node/node_modules/.bin:$PATH
# install app dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm ci

# add app
COPY . ./

# start app
CMD ["node", "index.js"]