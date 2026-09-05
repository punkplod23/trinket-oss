FROM node:20-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends rustc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY serverside/compiled-shell/package.json ./package.json
RUN npm install --omit=dev
COPY serverside/compiled-shell/server.js ./server.js

RUN mkdir -p /tmp/sessions && chmod 777 /tmp/sessions
ENV LANGUAGE=rust
ENV SOURCE_FILE=main.rs
ENV COMPILE_COMMAND="rustc main.rs -o main"
ENV RUN_COMMAND="./main"
EXPOSE 8010
CMD ["node", "server.js"]
