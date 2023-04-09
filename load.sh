#!/bin/bash

set -euxo pipefail

sudo modprobe v4l2loopback exclusive_caps=1

# Verify
v4l2-ctl --list-devices
# << Dummy video device (0x0000) (platform:v4l2loopback-000):
# <<        /dev/video0

device=/dev/video0
sudo v4l2loopback-ctl set-caps $device "RGB3:1280x720@30"
sudo v4l2-ctl -d $device -c timeout=3000

ffmpeg -re -f lavfi -i testsrc=duration=1:size=1280x720:rate=30 -pix_fmt rgb24 -f v4l2 /dev/video0
