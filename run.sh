#!/bin/bash

set -euxo pipefail

pkill firefox || true
rm -rf /home/user/data/lock || true
node dist/index.js
