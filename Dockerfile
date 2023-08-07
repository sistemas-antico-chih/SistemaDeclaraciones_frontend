#compile
FROM node:lts-buster as builder

WORKDIR /build

# COPY package.json ./
# RUN npm install

COPY . ./
ENV NODE_OPTIONS="--openssl-legacy-provider"
RUN npm install @types/node-fetch
RUN npm install npm@6.14.15
RUN npm run build --prod

#serve
FROM nginx:alpine

COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /build/dist/ /usr/share/nginx/html/
