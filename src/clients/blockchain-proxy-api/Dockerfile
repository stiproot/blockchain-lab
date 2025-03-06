FROM node:20-alpine as build
WORKDIR /app
COPY package*.json .
RUN npm install

COPY tsconfig.json .
COPY . .
RUN npm run build 

FROM node:20-alpine as runtime
WORKDIR /app

COPY nscacert.pem /app/nscacert.pem
ENV NODE_EXTRA_CA_CERTS=/app/nscacert.pem

RUN npm install -g pm2 && \
  apk add --no-cache nginx

COPY --from=build /app .
COPY pm2.config.js /app/pm2.config.js
COPY nginx.conf /etc/nginx/http.d/default.conf

EXPOSE 3002

CMD ["sh", "-c", "nginx -g 'daemon off;' & pm2-runtime start pm2.config.js"]
