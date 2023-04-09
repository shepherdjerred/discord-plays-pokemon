VERSION 0.7

emulator:
  FROM lscr.io/linuxserver/emulatorjs
  COPY roms /data/roms
  SAVE IMAGE emulator

puppeteer.deps:
  FROM DOCKERFILE .
  COPY package*.json .
  RUN npm install
  SAVE ARTIFACT * AS LOCAL .

puppeteer.build:
  FROM +puppeteer.deps
  COPY src .
  COPY tsconfig.json .
  RUN npm run build
  SAVE ARTIFACT dist

browser:
  FROM +puppeteer.build
  COPY .env .
  RUN mkdir ~/data
  COPY entrypoint.sh .
  ENTRYPOINT ./entrypoint.sh
  SAVE IMAGE browser

up:
  LOCALLY
  WITH DOCKER --compose compose.yml --load=+emulator --load=+browser
    RUN docker-compose up --abort-on-container-exit
  END
