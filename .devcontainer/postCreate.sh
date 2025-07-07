#!/bin/bash


pip3 install -r requirements.txt -r requirements_test.txt
curl -L https://github.com/CloudCannon/pagefind/releases/download/v1.1.0/pagefind-v1.1.0-x86_64-unknown-linux-musl.tar.gz | tar -xz -C ~/.local/bin
