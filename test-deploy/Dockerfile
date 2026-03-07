FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++ postgresql-client

COPY package.json ./
COPY scripts/ ./scripts/
RUN npm install --legacy-peer-deps

RUN sed -i 's/manager\.getEventManager()\.subscribers\.some/Array.from(manager.getEventManager().subscribers).some/g' \
  node_modules/@medusajs/utils/dist/modules-sdk/medusa-internal-service.js

COPY . .
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 8000
CMD ["/app/docker-entrypoint.sh"]
