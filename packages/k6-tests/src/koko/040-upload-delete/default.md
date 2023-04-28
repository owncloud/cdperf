# Description

The `upload delete` test is intended to see how the instance behaves when many users upload N files of size S, M and L each, and then deletes them again.


## Procedure

* `admin` creates `N` users.
  * `N` can be set by using the k6 `--vus` option.
  * by default, it set to 1.
* each `user` uploads `N` resources of size `S`.
  * `N` can be set with the environment variable `ASSET_SMALL_QUANTITY`.
  * `S` can be set with the environment variable `ASSET_SMALL_SIZE`.
* each `user` uploads `N` resources of size `M`.
  * `N` can be set with the environment variable `ASSET_MEDIUM_QUANTITY`.
  * `S` can be set with the environment variable `ASSET_MEDIUM_SIZE`.
* each `user` uploads `N` resources of size `L`.
  * `N` can be set with the environment variable `ASSET_LARGE_QUANTITY`.
  * `S` can be set with the environment variable `ASSET_LARGE_SIZE`.
* each `user` logs into the system individually.
* each `user` deletes his set of files.
* `admin` deletes the created users.

the test runs `N` times for each user, for example if you define `--vus 2` and `--iterations 5`
the testing steps as a whole will run 10 times (5 times per user).


## Available options

* [Shared options](/k6-tests/options)
* `FOLDER_ROOT_COUNT`: number of root folders to create
  * default value: `5`
  * `export FOLDER_ROOT_COUNT=10`
* `ASSET_SMALL_SIZE`: size of asset S as kb
  * default value: `10`
  * `export ASSET_SMALL_SIZE=20`
* `ASSET_SMALL_QUANTITY`: number uploads of that asset
  * default value: `1`
  * `export ASSET_SMALL_QUANTITY=2`
* `ASSET_MEDIUM_SIZE`: size of asset M as kb
  * default value: `100`
  * `export ASSET_MEDIUM_SIZE=200`
* `ASSET_MEDIUM_QUANTITY`: number uploads of that asset
  * default value: `1`
  * `export ASSET_MEDIUM_QUANTITY=2`
* `ASSET_LARGE_SIZE`: size of asset L as kb
  * default value: `1000`
  * `export ASSET_LARGE_SIZE=2000`
* `ASSET_LARGE_QUANTITY`: number uploads of that asset
  * default value: `1`
  * `export ASSET_LARGE_QUANTITY=2`


## How to run the test

please read [here](/k6-tests/run) how the test can be executed, only the script is different
