# Run the tests

all tests are executed in the same way, only the (options)[/k6-tests/options] and the way of execution differ. below you can see how this works

you can find more information on how use or install K6 [here](https://k6.io/docs/get-started/running-k6/). 

## The following platforms are supported
* [ownCloud Core](https://github.com/owncloud/core)
* [Infinite Scale](https://github.com/owncloud/ocis)
* [Nextcloud](https://github.com/nextcloud/server/)

## Requirements
*  [K6](https://k6.io/) (if k6 should run on the host machine)

## For ownCloud Infinite Scale

### local K6

```shell
PLATFORM_URL=https://cloud-domain.org:80 \
k6 run TEST_FILE.js --vus 2 --iterations 5
```

### in docker

```shell
docker run \
-e PLATFORM_URL=https://cloud-domain.org:80 \
--rm -i grafana/k6 run --vus 2 - < TEST_FILE.js
```

## For ownCloud Server

### local K6

```shell
PLATFORM=ownCloudServer \
PLATFORM_URL=https://cloud-domain.org:80 \
AUTH_N_PROVIDER=basicAuth \
k6 run TEST_FILE.js --vus 2 --iterations 5
```

### in docker

```shell
docker run \
-e PLATFORM=ownCloudServer \
-e PLATFORM_URL=https://cloud-domain.org:80 \
-e AUTH_N_PROVIDER=basicAuth \
--rm -i grafana/k6 run --vus 2 - < TEST_FILE.js
```

## For nextcloud

### local K6

```shell
PLATFORM=nextcloud \
PLATFORM_URL=https://cloud-domain.org:80 \
AUTH_N_PROVIDER=basicAuth \
k6 run TEST_FILE.js --vus 2 --iterations 5
```

### in docker

```shell
docker run \
-e PLATFORM=nextcloud \
-e PLATFORM_URL=https://cloud-domain.org:80 \
-e AUTH_N_PROVIDER=basicAuth \
--rm -i grafana/k6 run --vus 2 - < TEST_FILE.js
```
