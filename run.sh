#!/bin/bash

set -euxo pipefail

# Clear out files that Chrome dislikes
rm -rfv ~/data/Singleton*

node dist/main.js
