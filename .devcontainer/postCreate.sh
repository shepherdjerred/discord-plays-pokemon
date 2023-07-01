#!/bin/bash

set -euv

npm install -g npm

go install github.com/rhysd/actionlint/cmd/actionlint@latest

pre-commit install
pre-commit run
