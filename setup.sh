#!/bin/bash

set -xeuo

# https://aixxe.net/2021/04/discord-video-bot
# This script creates a fake video input device at /dev/video0
# It loads a custom kernel module, so it _cannot_ be run in Docker
# This virtual input device will be passed into Docker file streaming

# compiler, headers, etc.
sudo apt install build-essential make gcc linux-headers-$(uname -r) git

# gstreamer
sudo apt-get install libgstreamer1.0-dev libgstreamer-plugins-base1.0-dev libgstreamer-plugins-bad1.0-dev gstreamer1.0-plugins-base gstreamer1.0-plugins-good gstreamer1.0-plugins-bad gstreamer1.0-plugins-ugly gstreamer1.0-libav gstreamer1.0-tools gstreamer1.0-x gstreamer1.0-alsa gstreamer1.0-gl gstreamer1.0-gtk3 gstreamer1.0-qt5 gstreamer1.0-pulseaudio

sudo apt-get install v4l2loopback-dkms

# create a fake video device at /dev/video0
device=/dev/video0
sudo v4l2loopback-ctl set-caps 'video/x-raw, format=RGB, width=1024, height=768' $device
# send blank frames every 3 seconds if no input
v4l2-ctl -d $device -c timeout=3000

# write something to the device
ffmpeg -re -f lavfi -i testsrc=duration=1:size=1280x720:rate=30 -pix_fmt rgb24 -f v4l2 /dev/video0
