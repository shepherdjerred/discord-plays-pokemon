#!/bin/bash

set -xeuo pipefail

export DISPLAY=:1
Xvfb "${DISPLAY}" -screen 0 1920x1080x24 &
x11vnc -display "${DISPLAY}" -bg -forever -nopw -quiet -xkb
rm -rfv ~/data/Singleton*
node dist/script.js
