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
  FROM nvidia/opengl:1.2-glvnd-runtime-ubuntu20.04
  ARG DEBIAN_FRONTEND=noninteractive
  RUN apt update
  RUN apt install -y curl wget gnupg
  RUN curl -sL https://deb.nodesource.com/setup_lts.x -o /tmp/nodesource_setup.sh
  RUN bash /tmp/nodesource_setup.sh
  RUN apt install -y nodejs
  RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
  RUN sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
  RUN apt update
  RUN apt install -y google-chrome-stable
  RUN apt install -y x11vnc
  RUN DEBIAN_FRONTEND=noninteractive apt-get install -y xserver-xorg-video-dummy pkg-config mesa-utils libxv1 libglu1-mesa --no-install-recommends
  # RUN apt install -y xserver-xorg
  RUN apt install -y xserver-xorg-video-dummy
  RUN apt install -y sudo net-tools
  RUN echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers
  RUN wget https://sourceforge.net/projects/virtualgl/files/3.1/virtualgl_3.1_amd64.deb/download -O virtualgl.deb
  RUN apt install -y -f ./virtualgl.deb
  COPY xorg.conf /etc/X11/xorg.conf
  WORKDIR /home/pptruser
  RUN mkdir -p data
  RUN groupadd -r pptruser
  RUN useradd -r -g pptruser -G audio,video,tty pptruser
  RUN chown -R pptruser:pptruser /home/pptruser
  RUN usermod -aG sudo pptruser
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

new-image:
  FROM ghcr.io/selkies-project/nvidia-egl-desktop:latest
  ENV SIZEW=1920
  ENV SIZEH=1080
  ENV REFRESH=60
  ENV DPI=96
  ENV CDEPTH=24
  ENV PASSWD=mypasswd
  ENV WEBRTC_ENCODER=nvh264enc
  ENV BASIC_AUTH_PASSWORD=mypasswd
  ARG DEBIAN_FRONTEND=noninteractive
  USER root
  RUN apt update
  RUN apt install -y curl wget gnupg
  RUN curl -sL https://deb.nodesource.com/setup_lts.x -o /tmp/nodesource_setup.sh
  RUN bash /tmp/nodesource_setup.sh
  RUN apt install -y nodejs
  RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
  RUN sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
  RUN apt update
  RUN apt install -y google-chrome-stable
  WORKDIR /home/user
  RUN mkdir -p data
  USER user
  COPY package* .
  COPY +build/ .
  COPY +deps/node_modules node_modules
  IF [ $EARTHLY_CI = "false" ]
    COPY .env .env
  END
  COPY entrypoint.sh .
  # ENTRYPOINT ./entrypoint.sh
  SAVE IMAGE browser

up:
  LOCALLY
  RUN docker-compose down
  WITH DOCKER --compose compose.yml --load=+new-image
    RUN docker-compose up --abort-on-container-exit
  END
