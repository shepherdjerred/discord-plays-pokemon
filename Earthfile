VERSION 0.7
PROJECT sjerred/discord-plays-pokemon
ARG --global EARTHLY_CI

pipeline.pr:
  PIPELINE
  TRIGGER pr main
  BUILD +ci
  BUILD +devcontainer

pipeline.push:
  PIPELINE --push
  TRIGGER push main
  BUILD +ci
  BUILD +devcontainer
  BUILD ./packages/frontend+deploy.storybooks --prod=true

ci:
  BUILD +markdownlint
  BUILD ./docs+build
  BUILD +image
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

test:
  BUILD ./packages/backend+test
  BUILD ./packages/common+test
  BUILD ./packages/frontend+test

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
  COPY ./packages/backend/package* .
  COPY ./packages/backend/+build/ .
  COPY ./packages/backend/+deps/node_modules node_modules
  COPY ./packages/frontend/+build/ ui/
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
    RUN docker-compose -f misc/compose.yml up -d
  END

down:
  LOCALLY
  RUN docker-compose -f misc/compose.yml down

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
      devpod build github.com/shepherdjerred/discord-plays-pokemon --repository ghcr.io/shepherdjerred/discord-plays-pokemon --platform linux/amd64,linux/arm64
  END
