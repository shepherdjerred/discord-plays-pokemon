#!/bin/bash

set -xeuo

# https://aixxe.net/2021/04/discord-video-bot
# This script creates a fake video input device at /dev/video0
# It loads a custom kernel module, so it _cannot_ be run in Docker
# This virtual input device will be passed into Docker file streaming

# compiler, headers, etc.
sudo apt install build-essential make gcc linux-headers-$(uname -r) git

# gstreamer
apt-get install libgstreamer1.0-dev libgstreamer-plugins-base1.0-dev libgstreamer-plugins-bad1.0-dev gstreamer1.0-plugins-base gstreamer1.0-plugins-good gstreamer1.0-plugins-bad gstreamer1.0-plugins-ugly gstreamer1.0-libav gstreamer1.0-tools gstreamer1.0-x gstreamer1.0-alsa gstreamer1.0-gl gstreamer1.0-gtk3 gstreamer1.0-qt5 gstreamer1.0-pulseaudio

# video loopback module
sudo apt-get install linux-generic
sudo apt install dkms

git clone https://github.com/umlaeute/v4l2loopback
pushd v4l2loopback
make
sudo make install
# sudo modprobe v4l2loopback exclusive_caps=1

sudo cp -R . /usr/src/v4l2loopback-1.1
sudo dkms add -m v4l2loopback -v 1.1
sudo dkms build -m v4l2loopback -v 1.1
sudo dkms install -m v4l2loopback -v 1.1

popd

# verify virtual displays
ls -1 /sys/devices/virtual/video4linux

# audio loopback module
sudo apt-get install linux-image-generic alsa-utils
sudo apt install linux-modules-extra-`uname -r`
sudo modprobe snd-aloop pcm_substreams=1

# create a fake video device at /dev/video0
device=/dev/video0
sudo v4l2loopback-ctl set-caps 'video/x-raw, format=RGB, width=1024, height=768' $device
# send blank frames every 3 seconds if no input
v4l2-ctl -d $device -c timeout=3000

# write something to the device
ffmpeg -re -f lavfi -i testsrc=duration=1:size=1280x720:rate=30 -pix_fmt rgb24 -f v4l2 /dev/video0
