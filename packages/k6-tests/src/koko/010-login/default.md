# Description

The `login` test logs a configurable number of users into the system and checks whether the process was successful.


## Procedure

* `admin` creates `N` users.
  * `N` can be set with the k6 `--vus` option.
  * by default, it set to 1.
* each `user` logs into the system individually.
* `admin` deletes the created users.

the test runs `N` times for each user, for example if you define `--vus 2` and `--iterations 5`
the testing steps as a whole will run 10 times (5 times per user).


## Available options

* [Shared options](/k6-tests/options)


## How to run the test

please read [here](/k6-tests/run) how the test can be executed, only the script is different
