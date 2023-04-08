#!/bin/bash

set -euv

go install github.com/rhysd/actionlint/cmd/actionlint@latest

pre-commit install
pre-commit run
