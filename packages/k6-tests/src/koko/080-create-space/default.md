# Description

The `create space` test creates a configurable amount of spaces (per user) and deletes each at the end.


## Procedure

* `admin` creates `N` users.
  * `N` can be set by using the k6 `--vus` option.
  * by default, it set to 1.
* `admin` assigns the `spaceadmin`role to each user.
* each `user` logs into the system individually.
* each `user` creates `N` spaces.
  * `N` can be set with the environment variable `SPACE_COUNT`.
* each `user` deletes the created spaces to finalize the test.
* `admin` deletes the created users.

the test runs `N` times for each user, for example if you define `--vus 2` and `--iterations 5`
the testing steps as a whole will run 10 times (5 times per user).


## Compatibility

* :white_check_mark: ownCloud Infinite Scale
* :x: ownCloud Server
* :x: Nextcloud


## Available options

* [Shared options](/k6-tests/options)
* `SPACE_COUNT`: number spaces to create
  * default value: `2`
  * `export SPACE_COUNT=4`


## How to run the test

please read [here](/k6-tests/run) how the test can be executed, only the script is different
