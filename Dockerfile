#compile
FROM node:lts-buster as builder

WORKDIR /build

COPY package.json ./
#RUN npm cache clean --force
#RUN npm cache clear --force
RUN npm install npm@6.14.15
#RUN npm install
#RUN npm install npm@8.5.5
#RUN npm install -g npm@8.5.5

COPY . ./
RUN npm run build --prod

#serve
FROM nginx:alpine

COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /build/dist/ /usr/share/nginx/html/
