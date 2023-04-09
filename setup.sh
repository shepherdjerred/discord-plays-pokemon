#!/bin/bash

set -euxo pipefail

# https://aixxe.net/2021/04/discord-video-bot
# This script creates a fake video input device at /dev/video0
# It loads a custom kernel module, so it _cannot_ be run in Docker
# This virtual input device will be passed into Docker file streaming

# compiler, headers, etc.
sudo apt install -y build-essential make gcc linux-headers-$(uname -r) git gdb help2man

# gstreamer
sudo apt-get install -y libgstreamer1.0-dev libgstreamer-plugins-base1.0-dev libgstreamer-plugins-bad1.0-dev gstreamer1.0-plugins-base gstreamer1.0-plugins-good gstreamer1.0-plugins-bad gstreamer1.0-plugins-ugly gstreamer1.0-libav gstreamer1.0-tools gstreamer1.0-x gstreamer1.0-alsa gstreamer1.0-gl gstreamer1.0-gtk3 gstreamer1.0-qt5 gstreamer1.0-pulseaudio

# https://johnvansickle.com/ffmpeg/
wget https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz
tar -xf ffmpeg-release-amd64-static.tar.xz
sudo mv ffmpeg-6.0-amd64-static/ffmpeg /usr/local/bin/
sudo mv ffmpeg-6.0-amd64-static/ffprobe /usr/local/bin/
rm ffmpeg-release-amd64-static.tar.xz
rm -rfv ffmpeg-6.0-amd64-static

# install kernel module
sudo apt install -y v4l-utils
sudo apt install -y v4l2loopback-source module-assistant
sudo module-assistant auto-install v4l2loopback-source

# install cli
pushd ~
git clone https://github.com/umlaeute/v4l2loopback
pushd v4l2loopback
make
sudo make install-utils install-man
popd
popd
