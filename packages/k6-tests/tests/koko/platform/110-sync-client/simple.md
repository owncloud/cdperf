# Description

The `110 sync client` test tries to mimic a desktop client by sending propfind requests, the resource is picked randomly from the calendar seeds.
In 10% of the iterations the test sends 4 propfind requests per iterations, else only 1 propfind is sent.


## Procedure

* each `user` logs into the system individually.
* each `user iteration` sends a propfind.

the test runs `N` times for each user, for example if you define `--vus 2` and `--iterations 5`
the testing steps as a whole will run 10 times (5 times per user).


## Available options

* [Shared options](/k6-tests/src/values/env)


## How to run the test

please read [here](/k6-tests/docs/run) how the test can be executed, only the script is different
