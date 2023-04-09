VERSION 0.7
ARG --global EARTHLY_CI

ci:
  BUILD +image
  BUILD +lint
  BUILD +test

deps:
  FROM node:lts
  WORKDIR /workspace
  COPY package*.json .
  RUN npm ci
  SAVE ARTIFACT *

lint:
  FROM +deps
  COPY .eslintrc* .
  COPY .prettier* .
  COPY src .
  COPY test .
  IF [ $EARTHLY_CI = "true" ]
    RUN npm run lint:check
  ELSE
    RUN npm run lint:fix
    SAVE ARTIFACT * AS LOCAL .
  END

build:
  FROM +deps
  COPY src .
  COPY tsconfig.json .
  RUN npm run build
  SAVE ARTIFACT dist

image:
  FROM puppeteer
  USER root
  RUN apt-get update \
    && apt-get install -yq \
      xvfb \
      x11vnc
  COPY .env .
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
