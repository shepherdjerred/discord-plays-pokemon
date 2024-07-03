VERSION 0.7
PROJECT sjerred/discord-plays-pokemon
ARG --global EARTHLY_CI

ci:
  BUILD +image
  BUILD +build
  BUILD +lint
  BUILD +test

build:
  BUILD ./packages/backend+build
  BUILD ./packages/common+build
  BUILD ./packages/frontend+build

lint:
  BUILD ./packages/backend+lint
  BUILD ./packages/common+lint
  BUILD ./packages/frontend+lint
  BUILD +markdownlint
  BUILD +prettier

test:
  BUILD ./packages/backend+test
  BUILD ./packages/common+test
  BUILD ./packages/frontend+test

prettier:
  FROM +deps
  COPY . .
  IF [ $EARTHLY_CI = "false" ]
    RUN npm run prettier:fix
    SAVE ARTIFACT ./* AS LOCAL .
  ELSE
    RUN npm run prettier
  END

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
  RUN npm i -g npm
  CACHE $(npm config get cache)

deps:
  FROM +node
  COPY package*.json .
  RUN npm ci

image:
  FROM --platform=linux/amd64 ghcr.io/selkies-project/nvidia-egl-desktop:latest
  ARG DEBIAN_FRONTEND=noninteractive
  USER root
  RUN apt update
  RUN apt upgrade -y
  RUN apt install -y curl kde-config-screenlocker
  RUN curl -sL https://deb.nodesource.com/setup_lts.x -o /tmp/nodesource_setup.sh
  RUN bash /tmp/nodesource_setup.sh
  RUN apt install -y nodejs
  WORKDIR /home/user
  RUN mkdir -p data
  USER user
  RUN kwriteconfig5 --file kscreenlockerrc --group Daemon --key Autolock false
  RUN kwriteconfig5 --file ~/.config/powermanagementprofilesrc --group AC --group DPMSControl --key idleTime 540
  COPY ./packages/backend/package* .
  COPY ./packages/backend/+build/ packages/backend/
  COPY ./packages/backend/+deps/node_modules node_modules
  COPY ./packages/frontend/+build/ packages/frontend/
  COPY misc/run.sh .
  COPY misc/supervisord.conf .
  RUN cat supervisord.conf | sudo tee -a /etc/supervisord.conf
  RUN rm supervisord.conf
  RUN mkdir Downloads
  RUN sudo chown -R user:user Downloads
  SAVE IMAGE --push ghcr.io/shepherdjerred/discord-plays-pokemon:latest

up:
  LOCALLY
  RUN earthly +down
  WITH DOCKER --compose misc/compose.yml --load=+image
    RUN (cd packages/backend/ && docker compose up -d)
  END

down:
  LOCALLY
  RUN (cd packages/backend/ && docker compose down)
