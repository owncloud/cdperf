# Description

The `020 navigate file tree` test picks one random resource from the calendar seeds and sends a propfind request


## Procedure

* each `user` logs into the system individually.
* each `user iteration` sends a `propfind` request.

The test runs `N` times for each user. For example, if you define `--vus 2` and `--iterations 5`, the testing steps as a whole will run 10 times (5 times per user).


## Available options

* [Shared options](/k6-tests/src/values/env)


## How to run the test

please read [here](/k6-tests/docs/run) how the test can be executed, only the script is different

