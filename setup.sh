#!/bin/bash

set -euxo pipefail

# https://aixxe.net/2021/04/discord-video-bot
# This script creates a fake video input device at /dev/video0
# It loads a custom kernel module, so it _cannot_ be run in Docker
# This virtual input device will be passed into Docker file streaming

# compiler, headers, etc.
sudo apt install build-essential make gcc linux-headers-$(uname -r) git gdb help2man

# gstreamer
sudo apt-get install libgstreamer1.0-dev libgstreamer-plugins-base1.0-dev libgstreamer-plugins-bad1.0-dev gstreamer1.0-plugins-base gstreamer1.0-plugins-good gstreamer1.0-plugins-bad gstreamer1.0-plugins-ugly gstreamer1.0-libav gstreamer1.0-tools gstreamer1.0-x gstreamer1.0-alsa gstreamer1.0-gl gstreamer1.0-gtk3 gstreamer1.0-qt5 gstreamer1.0-pulseaudio

# used for testing
sudo apt-get install ffmpeg

# install kernel module
sudo apt install v4l-utils
sudo apt install v4l2loopback-source module-assistant
sudo module-assistant auto-install v4l2loopback-source
sudo modprobe v4l2loopback exclusive_caps=1

# install cli
git clone https://github.com/umlaeute/v4l2loopback
pushd v4l2loopback
make
sudo make install-utils install-man

# Verify
v4l2-ctl --list-devices
# << Dummy video device (0x0000) (platform:v4l2loopback-000):
# <<        /dev/video0

device=/dev/video0
sudo /usr/local/bin/v4l2loopback-ctl set-caps $device "RBG:1024x768"
# send blank frames every 3 seconds if no input
v4l2-ctl -d $device -c timeout=3000

# write something to the device
ffmpeg -re -f lavfi -i testsrc=duration=1:size=1280x720:rate=30 -pix_fmt rgb24 -f v4l2 /dev/video0
