## Requirements
*  [K6](https://k6.io/)
*  [YARN](https://yarnpkg.com/)
*  [OCIS](https://github.com/owncloud/ocis)

## How to build
```console
$ yarn
$ yarn build
```

## How to run
```console
k6 run ./dist/NAME_OF_TEST.js
```

## How add new tests
The best point to start is to have a look at the existing tests which can be found [here](src/test).

The tests ares structured by platform -> repo -> issue id -> name. For example /src/test/issue/github/ocis/42/test-name.ts gets test-issue-github-ocis-51-test-name.js

## How to test
It's important to know how to compare the tests against each other and what those numbers mean.

**Please note the following points:**
* Only compare clouds if they run on the same host
* Try to run the cloud on a different host then k6
* Try to keep traffic on the hosts as low as possible while testing
* Don't compare clouds that run in docker against non dockerized clouds
* Docker for macs is slow on file operations compared to linux
* Sometimes it's possible that one of the clouds will fail on some operations. Keep in mind that it's not possible to compared a test with failures against a test where all checks are green

**Test setup at ownCloud:**

At ownCloud we currently test two times a day on different servers. Server (A) is intel based and server (B) amd based.
The first test run, runs the tests on A which is testing on B and then B which is testing on A.
We collect those metrics over time to get indicators how the performance changes over time (version to version) and how the clouds perform in comparison to each other.

**How to read the test results**

Let's use 'test-issue-github-ocis-1018-propfind-flat.js' as example.
* Total time of execution
  * This is the time how long the test took for all users and iterations
* status
  * Red || Green is a quick overview how many requests are failed or not
* cloud_default_play_$PLAYNAME$_$OPERATION$_$TYPE$
  * PLAYNAME: name of the play, for example dav, users, ...
  * OPERATION: type of operation, for example create, delete, update, ...
  * TYPE: type of operation, for example trend (min, max, avg, ...) or error (count)

Only those numbers should be considered for comparison.
Don't forget to only compare same tests with same requirements.

## Environment variables
```console
$ CLOUD_LOGIN=USERNAME CLOUD_PASSWORD=PASSWORD k6 run ...
$ CLOUD_VENDOR=URL k6 run ...
$ CLOUD_ID=URL k6 run ...
$ CLOUD_HOST=URL k6 run ...
$ CLOUD_OIDC_ISSUER=URL k6 run ...
$ CLOUD_OIDC_ENABLED=BOOL k6 run ...
```