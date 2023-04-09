#!/bin/bash

set -xeuo pipefail

export DISPLAY=:1
Xvfb "${DISPLAY}" -screen 0 1280x720x24 &
x11vnc -display "${DISPLAY}" -bg -forever -nopw -quiet -xkb
rm -rfv ~/data/Singleton*
node dist/script.js
