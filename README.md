# ownCloud cloud testing toolbox
This repository contains the tools we use to test and measure the performance of different cloud systems.

Supported clouds are:
* [ownCloud Core](https://github.com/owncloud/core)
* [Infinite Scale](https://github.com/owncloud/ocis)
* [Nextcloud](https://github.com/nextcloud/server/)

## Requirements
*  [K6](https://k6.io/) (if k6 should run on the host machine)

## Usage
cdPerf is a collection of ready to use scripts which can used via k6 as described.
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

At ownCloud, k6 is used to compare the performance of the products during development. It is very helpful to understand how changes to the codebase affect the performance, between releases, but also between single commits.

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

## Dashboard
To visualize the test results, tools such as InfluxDB + Grafana are needed. To explain how the results can be visualized would go beyond the scope of this document and is also not the purpose of cdPerf. All necessary steps and a precise description of what is necessary can be found [here](https://k6.io/docs/results-output/real-time/).

## Security
If you find a security issue please contact [security@owncloud.com](mailto:security@owncloud.com) first

## Contributing
Fork -> Patch -> Push -> Pull Request

## License
Apache-2.0

## Dictonary
* **oCis**: [ownCloud Infinite Scale](https://github.com/owncloud/ocis)
* **k6-tdk**: k6 test development kit
* **cdPerf**: cloud performance

## Copyright
```console
Copyright (c) 2023 ownCloud GmbH <https://owncloud.com>
```
