FROM mcr.microsoft.com/devcontainers/base:jammy

RUN apt update -y && \
  apt upgrade -y && \
  apt install -y \
    build-essential \
    software-properties-common \
    neovim \
    zip \
    unzip \
    curl \
    wget

# The Ubuntu Docker image doesn't include normal utilities, e.g. man pages
# This will setup those utilities
RUN yes | unminimize

# Install Earthly
RUN curl --silent --location https://github.com/earthly/earthly/releases/latest/download/earthly-linux-amd64 --output /usr/local/bin/earthly && \
  chmod +x /usr/local/bin/earthly && \
    /usr/local/bin/earthly bootstrap --with-autocomplete

# Install Hadolint
ARG TARGETARCH
RUN curl --silent --location https://github.com/hadolint/hadolint/releases/download/v2.12.0/hadolint-Linux-x86_64 --output "hadolint-amd64"
RUN curl --silent --location https://github.com/hadolint/hadolint/releases/download/v2.12.0/hadolint-Linux-arm64 --output "hadolint-arm64"
RUN mv hadolint-$TARGETARCH /usr/local/bin/hadolint
RUN rm hadolint-*
RUN chmod +x /usr/local/bin/hadolint
