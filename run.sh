#!/bin/bash

set -euxo pipefail

pkill firefox || true
node dist/src/index.js
