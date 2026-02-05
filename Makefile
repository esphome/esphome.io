.PHONY: build dev preview clean install

SHELL := bash
.SHELLFLAGS := -euo pipefail -c

all: build

install:
	npm install

build:
	npm run build

dev:
	npm run dev

preview:
	npm run preview

clean:
	rm -rf dist/
	rm -rf node_modules/
	rm -rf .astro/

netlify:
	npm run build
