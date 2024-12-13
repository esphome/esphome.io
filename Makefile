ESPHOME_PATH = ../esphome
ESPHOME_REF = dev
PAGEFIND_VERSION=1.1.1
PAGEFIND=pagefind
NET_PAGEFIND=../pagefindbin/pagefind

.PHONY: pagefind build-html html html-strict cleanhtml deploy help live-html live-pagefind Makefile netlify netlify-api api netlify-dependencies svg2png copy-svg2png minify

html: pagefind
	sphinx-build -M html . _build -j auto -n $(O) -Dhtml_extra_path=_redirects,_pagefind

pagefind:
	sphinx-build -M html . _build -j auto -n $(O)
	mkdir -p _pagefind/pagefind
	${PAGEFIND}

live-html:	pagefind
	sphinx-autobuild . _build -j auto -n $(O) --host 0.0.0.0 -Dhtml_extra_path=_redirects,_pagefind

html-strict:
	sphinx-build -M html . _build -W -j auto -n $(O)

minify:
	minify _static/webserver-v1.js > _static/webserver-v1.min.js
	minify _static/webserver-v1.css > _static/webserver-v1.min.css

cleanhtml:
	rm -rf "_build/html/*"

svg2png:
	python3 svg2png.py

help:
	sphinx-build -M help . _build $(O)

api:
	mkdir -p _build/html/api
	@if [ ! -d "$(ESPHOME_PATH)" ]; then \
	  git clone --branch $(ESPHOME_REF) https://github.com/esphome/esphome.git $(ESPHOME_PATH) || \
	  git clone --branch beta https://github.com/esphome/esphome.git $(ESPHOME_PATH); \
	fi
	ESPHOME_PATH=$(ESPHOME_PATH) doxygen Doxygen

net-html:
	sphinx-build -M html . _build -j auto -n $(O)
	mkdir -p _pagefind/pagefind
	${NET_PAGEFIND}
	sphinx-build -M html . _build -j auto -n $(O) -Dhtml_extra_path=_redirects,_pagefind

netlify-api: netlify-dependencies
	mkdir -p _build/html/api
	@if [ ! -d "$(ESPHOME_PATH)" ]; then \
	  git clone --branch $(ESPHOME_REF) https://github.com/esphome/esphome.git $(ESPHOME_PATH) || \
	  git clone --branch beta https://github.com/esphome/esphome.git $(ESPHOME_PATH); \
	fi
	ESPHOME_PATH=$(ESPHOME_PATH) ../doxybin/doxygen Doxygen

netlify-dependencies: pagefind-binary
	mkdir -p ../doxybin
	curl -L https://github.com/esphome/esphome-docs/releases/download/v1.10.1/doxygen-1.8.13.xz | xz -d >../doxybin/doxygen
	chmod +x ../doxybin/doxygen

pagefind-binary:
	mkdir -p ../pagefindbin
	curl -o pagefind.tar.gz https://github.com/CloudCannon/pagefind/releases/download/v$(PAGEFIND_VERSION)/pagefind-v$(PAGEFIND_VERSION)-x86_64-unknown-linux-musl.tar.gz -L
	tar xzf pagefind.tar.gz
	rm pagefind.tar.gz
	mv pagefind ${NET_PAGEFIND}


copy-svg2png:
	cp svg2png/*.png _build/html/_images/

netlify: netlify-dependencies netlify-api net-html copy-svg2png

lint: html-strict
	python3 lint.py

clean:
	rm -rf _pagefind/
	sphinx-build -M clean . _build $(O)

# Catch-all target: route all unknown targets to Sphinx using the new
# "make mode" option.  $(O) is meant as a shortcut for $(SPHINXOPTS).
%: Makefile
	sphinx-build -M $@ . _build $(O)
