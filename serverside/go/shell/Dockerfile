FROM node:20-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends golang-go \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY serverside/compiled-shell/package.json ./package.json
RUN npm install --omit=dev
COPY serverside/compiled-shell/server.js ./server.js

RUN mkdir -p /tmp/sessions && chmod 777 /tmp/sessions
ENV LANGUAGE=go
ENV SOURCE_FILE=main.go
ENV COMPILE_COMMAND=
ENV RUN_COMMAND="go run main.go"
EXPOSE 8010
CMD ["node", "server.js"]
