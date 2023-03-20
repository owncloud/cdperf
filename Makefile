.ONESHELL:
ROOT_DIR:=$(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))

.PHONY: changelog
changelog:
	go run github.com/restic/calens -i ./changelog -t ./changelog/CHANGELOG.tmpl >| ./CHANGELOG.md
