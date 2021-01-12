# ownCloud cloud testing toolbox
This repository contains the tools we use to test the performance of different cloud systems.
Supported clouds are:
* [ownCloud](https://github.com/owncloud/core)
* [ocis](https://github.com/owncloud/core)
* [nextCloud](https://github.com/nextcloud/server/)

## Requirements
*  [K6](https://k6.io/) (if k6 should run on the host machine)
*  [Docker](https://docs.docker.com/)

## Usage
To see available options run ./scripts/cdperf --help

```shell
$ make clean build
$
$ # all available options
$ ./scripts/cdperf --help
$
$ # test with docker ocis and k6
$ ./scripts/cdperf --cloud-vendor=ocis --k6-test-host=https://host.docker.internal:9200
$
$ # test with local ocis and docker k6
$ ./scripts/cdperf --with-cloud-docker=false --cloud-vendor=ocis --k6-test-host=https://host.docker.internal:9200
$
$ # test with docker ocis and local k6
$ ./scripts/cdperf --with-k6-docker=false --cloud-vendor=ocis --k6-test-host=https://localhost:9200
$
$ # export test results to influxdb
$ ./scripts/cdperf --cloud-vendor=ocis --k6-test-host=https://host.docker.internal:9200 --k6-out=influxdb=http://admin:admin@host.docker.internal:8086/k6
$
$ # with cloud on remote docker host
$ ./scripts/cdperf --with-cloud-docker-host=ssh://user@your-host --cloud-vendor=ocis --k6-test-host=https://your-host:9200 
$  
```

## Dashboard
To visualize the test results you need an influxdb and grafana instance running.
At ownCloud we are using [https://github.com/owncloud-devops/k6-benchmark-visualization](https://github.com/owncloud-devops/k6-benchmark-visualization)