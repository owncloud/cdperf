# ownCloud cloud testing toolbox
This repository contains the tools we use to test the performance of different cloud systems.
Supported clouds are:
* [ownCloud](https://github.com/owncloud/core)
* [ocis](https://github.com/owncloud/core)
* [nextCloud](https://github.com/nextcloud/server/)

## Requirements
*  [K6](https://k6.io/)
*  [Docker](https://docs.docker.com/)

## Usage
To see available options run ./scripts/cdperf --help

### With cloud in docker
```
$ make clean build
$ ./scripts/cdperf --cloud-vendor=ocis
```

### With local k6
```
$ make clean build
$ ./scripts/cdperf --with-k6-docker=false --cloud-vendor=ocis
```

### With existing cloud installation
```
$ make clean build
$ ./scripts/cdperf --with-cloud-docker=false --cloud-vendor=ocis --cloud-host=https://your-host:9200
```

### With cloud in remote docker
```
$ make clean build
$ ./scripts/cdperf --with-cloud-docker-host=ssh://user@your-host --cloud-vendor=ocis --cloud-host=https://your-host:9200
```

### With dashboard
You can get a prepared grafana and influxdb installation [here](https://github.com/owncloud-devops/k6-benchmark-visualization)

```
$ make clean build
$ ./scripts/cdperf --cloud-vendor=ocis --cloud-host=https://your-host:9200 --k6-out=influxdb=http://user:passworf@your-host:8086/k6
```