# ownCloud cloud testing toolbox
This repository contains the tools we use to test and measure the performance of different cloud systems.

Supported clouds are:
* [ownCloud](https://github.com/owncloud/core)
* [ocis](https://github.com/owncloud/ocis)
* [nextCloud](https://github.com/nextcloud/server/)

## Requirements
*  [K6](https://k6.io/) (if k6 should run on the host machine)

## Usage
cdPerf is a collection of ready to use scripts which can used via k6 as described
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

**Usage at ownCloud:**

Here at ownCloud we use k6 to compare the performance of our cloud systems, also during development it is helpful to see how the changes made affect performance,
from release to release, from development version to development version, from change to change.

The first test run, runs the tests on A which is testing a server on B and then B which is testing on A.
We collect those metrics over time to get indicators of how the performance changes over time (version to version) and how the clouds perform in comparison to each other.

**How to read the test results**

* Total time of execution
    * This is the total elapsed time of the test for all users and iterations
* status
    * Red || Green is a quick overview of how many requests failed or not

for a more detailed instruction how to read the results you should consider reading the k6 manual,
specially the [end of test](https://k6.io/docs/results-output/end-of-test/) section.

## Available test suits
* koko
  * [010-login](packages/k6-tests/src/koko/010-login.md)
  * [020-navigate-file-tree](packages/k6-tests/src/koko/020-navigate-file-tree.md)
  * [040-upload-delete](packages/k6-tests/src/koko/040-upload-delete.md)
  * [050-upload-download](packages/k6-tests/src/koko/050-upload-download.md)
  * [060-create-rename-folder](packages/k6-tests/src/koko/060-create-rename-folder.md)
* oc
  * [share-upload-rename](packages/k6-tests/src/oc/share-upload-rename.md)
* sample
  * [kitchen-sink](packages/k6-tests/src/sample/kitchen-sink.md)
* surf
  * [upload](packages/k6-tests/src/surf/upload.md)

## Details
Read more about [considerations](docs/considerations.md) of performance measurement.
A precise description of what a test does and what the requirements are can be found in the respective test folder.

## Dashboard
To visualize the test results, tools such as InfluxDB + Grafana are needed,
to explain how the results can be visualized would go beyond the scope here and is also not the purpose of cdPerf. All necessary steps and a precise description of what is necessary can be found [here](https://k6.io/docs/results-output/real-time/).

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
