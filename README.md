# ownCloud cloud testing toolbox
This repository contains the tools we use to test the performance of different cloud systems.

Supported clouds are:
* [ownCloud](https://github.com/owncloud/core)
* [ocis](https://github.com/owncloud/ocis)
* [nextCloud](https://github.com/nextcloud/server/)

## Requirements
*  [K6](https://k6.io/) (if k6 should run on the host machine)
*  [Docker](https://docs.docker.com/)

## Usage
cdPerf is just a collection of prepared scripts which can used with k6 as described
[here](https://k6.io/docs/get-started/running-k6/).

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

* Total time of execution
    * This is the total elapsed time of the test for all users and iterations
* status
    * Red || Green is a quick overview of how many requests failed or not

for a more detailed instruction how to read the results you should consider reading the k6 manual,
specially the [end of test](https://k6.io/docs/results-output/end-of-test/) section.

## Details
Read more about [considerations](docs/considerations.md) of performance measurement.
A precise description of what a test does and what the requirements are can be found in the respective test folder.

## Available tests
* oc
  * [share-upload-rename](packages/k6-tests/src/oc/share-upload-rename.md)
* surf 
  * [upload](packages/k6-tests/src/surf/upload.md)

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
Copyright (c) 2023 ownCloud GmbH <https://owncloud.com>
```
