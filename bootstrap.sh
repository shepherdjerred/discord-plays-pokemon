#!/bin/bash

set -euxo pipefail

sudo apt update
sudo apt upgrade -y

curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
rm get-docker.sh

sudo groupadd docker
sudo usermod -aG docker $USER
newgrp docker

sudo curl -SL https://github.com/docker/compose/releases/download/v2.17.2/docker-compose-linux-x86_64 -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

curl -sL https://deb.nodesource.com/setup_lts.x -o /tmp/nodesource_setup.sh
sudo bash /tmp/nodesource_setup.sh
sudo apt install nodejs
sudo npm install -g npm@latest

sudo /bin/sh -c 'wget https://github.com/earthly/earthly/releases/latest/download/earthly-linux-amd64 -O /usr/local/bin/earthly && chmod +x /usr/local/bin/earthly && /usr/local/bin/earthly bootstrap --with-autocomplete'

# Required to be able to use Docker
sudo reboot
