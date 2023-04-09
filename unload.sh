#!/bin/bash

set -euxo pipefail

sudo modprobe -r v4l2loopback
