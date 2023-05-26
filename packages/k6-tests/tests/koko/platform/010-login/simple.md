# Description

The `010 login` test logs a configurable number of users into the system and checks whether the process was successful.


## Procedure

* each individual `user` authenticates himself at the idp

the test runs `N` times for each user, for example if you define `--vus 2` and `--iterations 5`
the testing steps as a whole will run 10 times (5 times per user).


## Available options

* [Shared options](/k6-tests/src/values/env)


## How to run the test

please read [here](/k6-tests/docs/run) how the test can be executed, only the script is different
