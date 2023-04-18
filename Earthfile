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
  FROM ghcr.io/selkies-project/nvidia-glx-desktop:latest
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
  COPY package* .
  COPY +build/ .
  COPY +deps/node_modules node_modules
  IF [ $EARTHLY_CI = "false" ]
    COPY .env .env
  END
  COPY run.sh .
  COPY supervisord.conf .
  RUN cat supervisord.conf | sudo tee -a /etc/supervisord.conf
  RUN rm supervisord.conf
  RUN cp MediaEngineStore.json .
  SAVE IMAGE browser

up:
  LOCALLY
  RUN earthly +down
  WITH DOCKER --compose compose.yml --load=+image
    RUN docker-compose up --abort-on-container-exit
  END

down:
  LOCALLY
  RUN docker-compose down
