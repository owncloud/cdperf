# Description

The `070 user group search` test takes a random user from the user pool and then searches for it.


## Procedure

* each `user` logs into the system individually.
* each `user iteration` searches for the sharee user.

the test runs `N` times for each user, for example if you define `--vus 2` and `--iterations 5`
the testing steps as a whole will run 10 times (5 times per user).


## Available options

* [Shared options](/k6-tests/src/values/env)


## How to run the test

please read [here](/k6-tests/docs/run) how the test can be executed, only the script is different
