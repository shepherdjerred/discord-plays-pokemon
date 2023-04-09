VERSION 0.7

emulator:
  FROM lscr.io/linuxserver/emulatorjs
  COPY roms /data/roms
  SAVE IMAGE emulator

browser:
  FROM +puppeteer.build
  COPY .env .
  RUN mkdir ~/data
  SAVE IMAGE browser

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

up:
  LOCALLY
  RUN ./unload.sh
  RUN ./load.sh
  WITH DOCKER --compose compose.yml --load=+emulator --load=+browser
    RUN docker-compose up --abort-on-container-exit
  END
