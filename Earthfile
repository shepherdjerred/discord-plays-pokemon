VERSION 0.7
ARG --global EARTHLY_CI

ci:
  BUILD +markdownlint
  BUILD ./docs+build
  BUILD +image
  BUILD +lint
  BUILD +test

markdownlint:
  FROM davidanson/markdownlint-cli2
  COPY . .
  IF [ "$EARTHLY_CI" = "false" ]
    RUN markdownlint-cli2-fix '**/*.md'
    SAVE ARTIFACT ./* AS LOCAL .
  ELSE
    RUN markdownlint-cli2 '**/*.md'
  END

node:
  FROM node:lts
  WORKDIR /workspace
  CACHE $(npm config get cache)

deps:
  FROM +node
  COPY package*.json .
  RUN npm ci
  SAVE ARTIFACT *

src:
  FROM +deps
  COPY tsconfig.json .
  COPY src src

lint:
  FROM +src
  COPY .eslint* .
  COPY .prettier* .
  COPY test test
  IF [ $EARTHLY_CI = "true" ]
    RUN npm run lint:check
  ELSE
    RUN npm run lint:fix
    SAVE ARTIFACT ./* AS LOCAL .
  END

build:
  FROM +src
  RUN npm run build
  SAVE ARTIFACT dist AS LOCAL dist

test:
  FROM +src
  COPY jest* .
  COPY test .
  RUN npm run test
  SAVE ARTIFACT coverage AS LOCAL coverage

image:
  FROM node:lts
  RUN apt-get update \
      && apt-get install -y wget gnupg \
      && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
      && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
      && apt-get update \
      && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 --no-install-recommends \
      && rm -rf /var/lib/apt/lists/*
  RUN apt-get update \
      && apt-get install -yq gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget x11vnc x11-xkb-utils xfonts-100dpi xfonts-75dpi xfonts-scalable xfonts-cyrillic x11-apps xvfb
  RUN apt-get install -y x11vnc
  RUN mkdir -p /home/pptruser/Downloads
  WORKDIR /home/pptruser
  RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
      && chown -R pptruser:pptruser /home/pptruser
  USER pptruser
  COPY package* .
  COPY +build/ .
  COPY +deps/node_modules node_modules
  IF [ $EARTHLY_CI = "false" ]
    COPY .env .env
  END
  COPY entrypoint.sh .
  ENTRYPOINT ./entrypoint.sh
  SAVE IMAGE browser

up:
  LOCALLY
  WITH DOCKER --compose compose.yml --load=+image
    RUN docker-compose up --abort-on-container-exit
  END
