FROM node:20-alpine AS build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --omit=dev
COPY server/ ./
COPY --from=build /app/client/dist /app/client/dist
ENV UPLOAD_DIR=/data/uploads
VOLUME /data/uploads
EXPOSE 5000
CMD ["node", "server.js"]
