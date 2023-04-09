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
  FROM ghcr.io/puppeteer/puppeteer
  USER root
  RUN apt-get update \
    && apt-get install -yq \
      xvfb \
      x11vnc
  IF [ $EARTHLY_CI = "false" ]
    COPY .env .
  END
  RUN mkdir ~/data
  COPY entrypoint.sh .
  COPY +build/ .
  ENTRYPOINT ./entrypoint.sh
  USER pptruser
  SAVE IMAGE browser

up:
  LOCALLY
  WITH DOCKER --compose compose.yml --load=+image
    RUN docker-compose up --abort-on-container-exit
  END
