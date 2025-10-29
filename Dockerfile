FROM nginx:alpine
RUN apk update
RUN apk add nodejs
RUN apk add npm

    WORKDIR /usr/share/nginx/html
COPY . .

RUN npm install