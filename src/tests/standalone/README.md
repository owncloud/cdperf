# WARNING

These tests cannot be run with cdperf. Please run these test with K6 only

## Model user ramping up stress test

### Description

We created a model of an hypothetical user, which interacts with the cloud system.
The purpose of this test is to see how many users a cloud system can serve. This test ramps up the number of concurrent users depending on your setting. When looking at the metrics test suite and the the cloud system, you can draw conclusions about the reliability of the system.

The test lets you define two values: - `TARGET_BASE_VUS`: the number of regular users during low load, to warm up your system - `TARGET_MAX_VUS`: the number of peak users during high load, to stress your system

### How to run

#### using cdper-k6 in the container

On your machine:

```shell
make build
docker run -it owncloud/cdperf-k6:latest bash
```

You're now inside the cdperf-k6 container and can start the test:

```shell
export CLOUD_HOST=https://ocis.owncloud.test
export CLOUD_OIDC_ENABLED=true

export TARGET_BASE_VUS=10
export TARGET_MAX_VUS=100

k6 run k6-standalone-tests/model-user-ramping-up-stress-test.js
```

#### using k6 localy

install k6 on your machine: https://k6.io/docs/get-started/installation/

start the command:

```shell
make local
```

run the stress test: 

```shell
export CLOUD_OIDC_ENABLED=true
export CLOUD_HOST=https://localhost:9200
export CLOUD_LOGIN=admin
export CLOUD_PASSWORD=admin
export CLOUD_VENDOR=ocis

k6 run --insecure-skip-tls-verify tests/standalone/model-user-ramping-up-stress-test.js
```