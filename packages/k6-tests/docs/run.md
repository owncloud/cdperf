# Run the tests

all tests are executed in the same way, only the (options)[/k6-tests/src/values/env] and the way of execution differ. below you can see how this works

you can find more information on how use or install K6 [here](https://k6.io/docs/get-started/running-k6/). 

## The following platforms are supported
* [ownCloud Infinite Scale](https://github.com/owncloud/ocis)
* [ownCloud Core](https://github.com/owncloud/core)
* [Nextcloud](https://github.com/nextcloud/server/)

## Requirements
*  [K6](https://k6.io/) (if k6 should run on the host machine)

## For ownCloud Infinite Scale

### local K6

```shell
PLATFORM_BASE_URL=https://cloud-domain.org:80 \
k6 run TEST_FILE.js --vus 2 --iterations 5
```

### in docker

```shell
docker run \
-e PLATFORM_BASE_URL=https://cloud-domain.org:80 \
--rm -i grafana/k6 run --vus 2 - < TEST_FILE.js
```

## For ownCloud Server

### local K6

```shell
PLATFORM_TYPE=ownCloudServer \
PLATFORM_BASE_URL=https://cloud-domain.org:80 \
AUTH_N_PROVIDER_TYPE=basicAuth \
k6 run TEST_FILE.js --vus 2 --iterations 5
```

### in docker

```shell
docker run \
-e PLATFORM_TYPE=ownCloudServer \
-e PLATFORM_BASE_URL=https://cloud-domain.org:80 \
-e AUTH_N_PROVIDER_TYPE=basicAuth \
--rm -i grafana/k6 run --vus 2 - < TEST_FILE.js
```

## For nextcloud

### local K6

```shell
PLATFORM_TYPE=nextcloud \
PLATFORM_BASE_URL=https://cloud-domain.org:80 \
AUTH_N_PROVIDER_TYPE=basicAuth \
k6 run TEST_FILE.js --vus 2 --iterations 5
```

### in docker

```shell
docker run \
-e PLATFORM_TYPE=nextcloud \
-e PLATFORM_BASE_URL=https://cloud-domain.org:80 \
-e AUTH_N_PROVIDER_TYPE=basicAuth \
--rm -i grafana/k6 run --vus 2 - < TEST_FILE.js
```
