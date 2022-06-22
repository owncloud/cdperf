.ONESHELL:
ROOT_DIR:=$(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))

.PHONY: build
build:
	docker build --tag owncloud/cdperf-k6 .
	docker run --rm --volume $(ROOT_DIR)/tests:/cp owncloud/cdperf-k6 cp -r . /cp
	chmod +x ./scripts/cdperf

.PHONY: local
local: clean
	yarn && yarn build

.PHONY: clean
clean:
	rm -rf ./tests

.PHONY: changelog
changelog:
	go run github.com/restic/calens -i ./changelog -t ./changelog/CHANGELOG.tmpl >| ./CHANGELOG.md
