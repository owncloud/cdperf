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
$ ./scripts/cdperf --cloud-docker=false --cloud-vendor=ocis --k6-test-host=https://host.docker.internal:9200
$
$ # test with docker ocis and local k6
$ ./scripts/cdperf --cloud-vendor=ocis --k6-test-host=https://localhost:9200 --k6-docker=false
$
$ # export test results to influxdb
$ ./scripts/cdperf --cloud-vendor=ocis --k6-test-host=https://host.docker.internal:9200 --k6-out=influxdb=http://admin:admin@host.docker.internal:8086/k6
$
$ # with cloud on remote docker host
$ ./scripts/cdperf --cloud-docker-host=ssh://user@your-host --cloud-vendor=ocis --k6-test-host=https://your-host:9200
```

## How to test
It's important to know how to compare the tests against each other and what those numbers mean.

**Please note the following points:**
* Only compare clouds if they run on the same host
* Try to run the cloud on a different host than the k6 test-runner
* Try to keep traffic on the hosts as low as possible while testing
* Don't compare clouds that run in docker against non dockerized clouds
* Docker for macs is slow on file operations compared to linux
* Sometimes it's possible that one of the clouds will fail on some operations. Keep in mind that it's not valid to compare a test with failures against a test where all checks are green

**Test setup at ownCloud:**

At ownCloud we currently test two times a day on different servers. Server (A) is intel based and server (B) amd based.
The first test run, runs the tests on A which is testing a server on B and then B which is testing on A.
We collect those metrics over time to get indicators of how the performance changes over time (version to version) and how the clouds perform in comparison to each other.

**How to read the test results**

Let's use 'test-issue-github-ocis-1018-propfind-flat.js' as an example.
* Total time of execution
    * This is the total elapsed time of the test for all users and iterations
* status
    * Red || Green is a quick overview of how many requests failed or not
* cloud_default_play_$PLAYNAME$_$OPERATION$_$TYPE$
    * PLAYNAME: name of the play, for example dav, users, ...
    * OPERATION: type of operation, for example create, delete, update, ...
    * TYPE: type of operation, for example trend (min, max, avg, ...) or error (count)

Only those numbers should be considered for comparison.
Don't forget to only compare same tests with same requirements.

## Dashboard
To visualize the test results you need an influxdb and grafana instance running.
At ownCloud, we are using [https://github.com/owncloud-devops/k6-benchmark-visualization](https://github.com/owncloud-devops/k6-benchmark-visualization)

## Security
If you find a security issue please contact [security@owncloud.com](mailto:security@owncloud.com) first

## Contributing
Fork -> Patch -> Push -> Pull Request

## License
Apache-2.0

## Copyright
```console
Copyright (c) 2021 ownCloud GmbH <https://owncloud.com>
```
