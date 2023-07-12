# ownCloud cloud testing toolbox
This repository contains the tools we use to test and measure the performance of different cloud systems.

## Usage
Please read the [how to run](https://owncloud.dev/cdperf/k6-tests/docs/run) section.

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

## Dashboard
To visualize the test results, tools such as InfluxDB + Grafana are needed. To explain how the results can be visualized would go beyond the scope of this document and is also not the purpose of cdPerf. All necessary steps and a precise description of what is necessary can be found [here](https://k6.io/docs/results-output/real-time/).
