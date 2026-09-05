FROM node:20.19-bookworm

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

EXPOSE 8100

CMD ["node", "manager.js"]
