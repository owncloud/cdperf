# Run the tests

All tests are executed in the same way, only the [options](/k6-tests/src/values/env) and the way of execution differ. Below you can see how this works.

You can find more information on how use or install K6 [here](https://k6.io/docs/get-started/running-k6/). 

All tests need to run with the admin user who is capable of provisioning users. If you have a non standard password for admin, set the environment variables `ADMIN_LOGIN` and `ADMIN_PASSWORD` to match that.

## The following platforms are supported
* [ownCloud Infinite Scale](https://github.com/owncloud/ocis)
* [ownCloud Core](https://github.com/owncloud/core)
* [Nextcloud](https://github.com/nextcloud/server/)

## Requirements
*  [K6](https://k6.io/) (if k6 should run on the host machine)

## For ownCloud Infinite Scale

### Local K6

```shell
PLATFORM_BASE_URL=https://cloud-domain.org:80 \
k6 run TEST_FILE.js --vus 2 --iterations 5
```

### In docker

```shell
docker run \
-e PLATFORM_BASE_URL=https://cloud-domain.org:80 \
--rm -i grafana/k6 run --vus 2 - < TEST_FILE.js
```

## For ownCloud Server

### Local K6

```shell
PLATFORM_TYPE=ownCloudServer \
PLATFORM_BASE_URL=https://cloud-domain.org:80 \
AUTH_N_PROVIDER_TYPE=basicAuth \
k6 run TEST_FILE.js --vus 2 --iterations 5
```

### In docker

```shell
docker run \
-e PLATFORM_TYPE=ownCloudServer \
-e PLATFORM_BASE_URL=https://cloud-domain.org:80 \
-e AUTH_N_PROVIDER_TYPE=basicAuth \
--rm -i grafana/k6 run --vus 2 - < TEST_FILE.js
```

## For Nextcloud

### Local K6

```shell
PLATFORM_TYPE=nextcloud \
PLATFORM_BASE_URL=https://cloud-domain.org:80 \
AUTH_N_PROVIDER_TYPE=basicAuth \
k6 run TEST_FILE.js --vus 2 --iterations 5
```

### In docker

```shell
docker run \
-e PLATFORM_TYPE=nextcloud \
-e PLATFORM_BASE_URL=https://cloud-domain.org:80 \
-e AUTH_N_PROVIDER_TYPE=basicAuth \
--rm -i grafana/k6 run --vus 2 - < TEST_FILE.js
```
