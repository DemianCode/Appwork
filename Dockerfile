FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/client/dist ./client/dist

ENV NODE_ENV=production
ENV APPWORK_HOST=0.0.0.0
ENV APPWORK_PORT=4173
ENV APPWORK_PROJECTS_DIR=/data/projects

EXPOSE 4173
VOLUME ["/data/projects"]

CMD ["node", "server/dist/index.js"]
