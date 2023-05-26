# Description

The `080 create space` test creates a space (per user iteration) and deletes it again.


## Procedure

* each `user` logs into the system individually.
* each `user iteration` creates a space.
* each `user iteration` deletes the space.

the test runs `N` times for each user, for example if you define `--vus 2` and `--iterations 5`
the testing steps as a whole will run 10 times (5 times per user).


## Compatibility

* :white_check_mark: ownCloud Infinite Scale
* :x: ownCloud Server
* :x: Nextcloud


## Available options

* [Shared options](/k6-tests/src/values/env)


## How to run the test

please read [here](/k6-tests/docs/run) how the test can be executed, only the script is different
