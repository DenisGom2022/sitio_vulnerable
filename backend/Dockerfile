FROM node:20-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .
RUN mkdir -p /app/uploads
ENV NODE_ENV=production PORT=4000
EXPOSE 4000
CMD ["node", "server.js"]
