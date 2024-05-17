# ownCloud cloud testing toolbox
This repository contains the tools we use to test and measure the performance of different cloud systems.

## Quickstart

### Provision users
First provision some test users. Note that the default ramping test uses 3750 VUs. A small scale example can be found below as well
```shell
ADMIN_LOGIN=admin \
ADMIM_PASSWORD=admin \
PLATFORM_BASE_URL=https://localhost:9200 \
SEED_USERS_TOTAL=75 \
AUTH_N_PROVIDER_KOPANO_BASE_URL=https://localhost:9200 \
AUTH_N_PROVIDER_KOPANO_REDIRECT_URL=https://localhost:9200/oidc-callback.html \
k6 run packages/k6-tests/artifacts/_seeds-up-k6.js
```
To add more users set the number of desired VUs and rerun the tests. There will be errors for the users that already exist, but the remaining users will be created.

### Simple test with static number of users 
To run a simple test, the number of VUs that should be simulated to execute the test scenario for the given number of iterations pick one of the existing tests. Thear name should describe what the user will be doing. Every test will wait between requests to simulate actual user behavior and not just hammer the server with requests.
```shell
ADMIN_LOGIN=admin \
ADMIM_PASSWORD=admin \
PLATFORM_BASE_URL=https://localhost:9200 \
AUTH_N_PROVIDER_KOPANO_BASE_URL=https://localhost:9200 \
AUTH_N_PROVIDER_KOPANO_REDIRECT_URL=https://localhost:9200/oidc-callback.html \
k6 run packages/k6-tests/artifacts/koko-platform-040-create-upload-rename-delete-folder-and-file-simple-k6.js --vus 25 --iterations 125
```


### 6min quick ramp test (2m up / 3m peak / 1m down)
Reducing the duration of the phases requires setting a lot of env vars, but it it a good initial test. This configuration will use all 75 test users created by the above seed run.
```shell
TEST_KOKO_PLATFORM_020_RAMPING_STAGES_UP_DURATION=2m \
TEST_KOKO_PLATFORM_020_RAMPING_STAGES_PEAK_DURATION=3m \
TEST_KOKO_PLATFORM_020_RAMPING_STAGES_DOWN_DURATION=1m \
TEST_KOKO_PLATFORM_040_RAMPING_STAGES_UP_DURATION=2m \
TEST_KOKO_PLATFORM_040_RAMPING_STAGES_PEAK_DURATION=3m \
TEST_KOKO_PLATFORM_040_RAMPING_STAGES_DOWN_DURATION=1m \
TEST_KOKO_PLATFORM_050_RAMPING_STAGES_UP_DURATION=2m \
TEST_KOKO_PLATFORM_050_RAMPING_STAGES_PEAK_DURATION=3m \
TEST_KOKO_PLATFORM_050_RAMPING_STAGES_DOWN_DURATION=1m \
TEST_KOKO_PLATFORM_070_RAMPING_STAGES_UP_DURATION=2m \
TEST_KOKO_PLATFORM_070_RAMPING_STAGES_PEAK_DURATION=3m \
TEST_KOKO_PLATFORM_070_RAMPING_STAGES_DOWN_DURATION=1m \
TEST_KOKO_PLATFORM_080_RAMPING_STAGES_UP_DURATION=2m \
TEST_KOKO_PLATFORM_080_RAMPING_STAGES_PEAK_DURATION=3m \
TEST_KOKO_PLATFORM_080_RAMPING_STAGES_DOWN_DURATION=1m \
TEST_KOKO_PLATFORM_090_RAMPING_STAGES_UP_DURATION=2m \
TEST_KOKO_PLATFORM_090_RAMPING_STAGES_PEAK_DURATION=3m \
TEST_KOKO_PLATFORM_090_RAMPING_STAGES_DOWN_DURATION=1m \
TEST_KOKO_PLATFORM_100_RAMPING_STAGES_UP_DURATION=2m \
TEST_KOKO_PLATFORM_100_RAMPING_STAGES_PEAK_DURATION=3m \
TEST_KOKO_PLATFORM_100_RAMPING_STAGES_DOWN_DURATION=1m \
TEST_KOKO_PLATFORM_110_RAMPING_STAGES_UP_DURATION=2m \
TEST_KOKO_PLATFORM_110_RAMPING_STAGES_PEAK_DURATION=3m \
TEST_KOKO_PLATFORM_110_RAMPING_STAGES_DOWN_DURATION=1m \
TEST_KOKO_PLATFORM_020_RAMPING_STAGES_VUS=20 \
TEST_KOKO_PLATFORM_040_RAMPING_STAGES_VUS=10 \
TEST_KOKO_PLATFORM_050_RAMPING_STAGES_VUS=10 \
TEST_KOKO_PLATFORM_070_RAMPING_STAGES_VUS=4 \
TEST_KOKO_PLATFORM_080_RAMPING_STAGES_VUS=1 \
TEST_KOKO_PLATFORM_090_RAMPING_STAGES_VUS=5 \
TEST_KOKO_PLATFORM_100_RAMPING_STAGES_VUS=5 \
TEST_KOKO_PLATFORM_110_RAMPING_STAGES_VUS=20 \
ADMIN_LOGIN=admin \
ADMIM_PASSWORD=admin \
PLATFORM_BASE_URL=https://localhost:9200 \
AUTH_N_PROVIDER_KOPANO_BASE_URL=https://localhost:9200 \
AUTH_N_PROVIDER_KOPANO_REDIRECT_URL=https://localhost:9200/oidc-callback.html \
k6 run packages/k6-tests/artifacts/koko-platform-000-mixed-ramping-k6.js
```

### 1h ramping test (20m up / 30m peak / 10m down)
The ramping test mixes all scenarios and will slowly add VUs until the end of the ramp up phase.
The configured number of VUs will remain active during the peak phase and then be reduced to 0 during ramp down.
This kind of setup can be used to monitor the system under the expected workload by changing the VUs per test scenario as needed.
```shell
TEST_KOKO_PLATFORM_020_RAMPING_STAGES_VUS=1000 \
TEST_KOKO_PLATFORM_040_RAMPING_STAGES_VUS=500 \
TEST_KOKO_PLATFORM_050_RAMPING_STAGES_VUS=500 \
TEST_KOKO_PLATFORM_070_RAMPING_STAGES_VUS=200 \
TEST_KOKO_PLATFORM_080_RAMPING_STAGES_VUS=50 \
TEST_KOKO_PLATFORM_090_RAMPING_STAGES_VUS=250 \
TEST_KOKO_PLATFORM_100_RAMPING_STAGES_VUS=250 \
TEST_KOKO_PLATFORM_110_RAMPING_STAGES_VUS=1000 \
ADMIN_LOGIN=admin \
ADMIM_PASSWORD=admin \
PLATFORM_BASE_URL=https://localhost:9200 \
AUTH_N_PROVIDER_KOPANO_BASE_URL=https://localhost:9200 \
AUTH_N_PROVIDER_KOPANO_REDIRECT_URL=https://localhost:9200/oidc-callback.html \
k6 run packages/k6-tests/artifacts/koko-platform-000-mixed-ramping-k6.js
```

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
