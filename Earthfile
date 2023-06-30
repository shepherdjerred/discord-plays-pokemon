VERSION 0.7
PROJECT sjerred/discord-plays-pokemon
ARG --global EARTHLY_CI

pipeline:
  PIPELINE --push
  TRIGGER push main
  TRIGGER pr main
  BUILD +ci

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
  COPY test test
  RUN npm run test
  SAVE ARTIFACT coverage AS LOCAL coverage

image:
  FROM ghcr.io/selkies-project/nvidia-egl-desktop
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
  RUN mkdir Downloads
  RUN sudo chown -R user:user Downloads
  SAVE IMAGE --push ghcr.io/shepherdjerred/discord-plays-pokemon:latest

up:
  LOCALLY
  RUN earthly +down
  WITH DOCKER --compose compose.yml --load=+image
    RUN docker-compose up -d
  END

down:
  LOCALLY
  RUN docker-compose down

devcontainer:
  FROM earthly/dind:ubuntu
  WORKDIR /workspace
  ARG TARGETARCH
  ARG version=0.1.11-beta.0
  RUN curl --location --fail --silent --show-error -o /usr/local/bin/devpod https://github.com/loft-sh/devpod/releases/download/v$version/devpod-linux-$TARGETARCH
  RUN chmod +x /usr/local/bin/devpod
  COPY .devcontainer/devcontainer.json .
  RUN --push --secret GITHUB_TOKEN=github_token echo $GITHUB_TOKEN | docker login ghcr.io -u shepherdjerred --password-stdin
  WITH DOCKER
    RUN devpod provider add docker && \
      devpod build github.com/shepherdjerred/discord-plays-pokemon --repository ghcr.io/shepherdjerred/discord-plays-pokemon
  END
