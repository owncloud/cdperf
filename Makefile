ROOT_DIR:=$(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))

.PHONY: build
build:
	docker build --tag owncloud/cdperf-k6 src/k6
	docker run --rm --volume $(ROOT_DIR)/dist/k6:/cp owncloud/cdperf-k6 cp -r . /cp
	chmod +x ./scripts/cdperf

.PHONY: clean
clean:
	rm -rf ./dist