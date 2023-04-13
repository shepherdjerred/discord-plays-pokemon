#!/bin/bash

set -xeuo pipefail

export DISPLAY=:0
sudo /usr/bin/X $DISPLAY &

# x11vnc -display "${DISPLAY}" -bg -forever -nopw -quiet -xkb -auth guess

rm -rfv ~/data/Singleton*
node dist/script.js
