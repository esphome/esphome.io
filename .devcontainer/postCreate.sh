#!/bin/bash
set -euo pipefail

sudo apt update && sudo apt install -y hugo

pip3 install -r requirements_test.txt
pre-commit install

mkdir -p ~/.local/bin
curl -L https://github.com/CloudCannon/pagefind/releases/download/v1.3.0/pagefind-v1.3.0-x86_64-unknown-linux-musl.tar.gz | tar -xz -C ~/.local/bin
