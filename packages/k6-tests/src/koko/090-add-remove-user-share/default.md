# Description

The `add remove user share` test creates a configurable amount of share receivers (users) and one folder per vu,
once the provisioning is done, the user shares the created folder with each share receiver 
and then un-shares that folder at the test end.


## Procedure

* `admin` creates `N` users.
  * `N` can be set by using the k6 `--vus` option.
  * by default, it set to 1.
* `admin` creates `N` share receiver users.
  * `N` can be set with the environment variable `SHARE_RECEIVERS_USER_COUNT`.
* each `user` creates 1 sharing folder.
* each `user` logs into the system individually.
* each `user` shares the folder every share receiver.
* each `user` un-shares the folder every share receiver.
* `admin` deletes the created users.
* `admin` deletes the created share receiver users.

the test runs `N` times for each user, for example if you define `--vus 2` and `--iterations 5`
the testing steps as a whole will run 10 times (5 times per user).


## Available options

* [Shared options](/k6-tests/options)
* `SHARE_RECEIVERS_USER_COUNT`: number of share user receivers to create
  * default value: `35`
  * `export SHARE_RECEIVERS_USER_COUNT=70`


## How to run the test

please read [here](/k6-tests/run) how the test can be executed, only the script is different
