# Description

The `navigate file tree` test creates a configurable horizontal and vertical structure of folders which is then checked using a propfind at each level.


## Procedure

* `admin` creates `N` users.
  * `N` can be set by using the k6 `--vus` option.
  * by default, it set to 1.
* each `user` create a folder tree of with `W` and depth `D`.
  * `W` can be set with the environment variable `FOLDER_ROOT_COUNT`.
  * `D` can be set with the environment variable `FOLDER_CHILD_COUNT`.
* each `user` logs into the system individually.
* each `user` loops through the folder tree and sends a `propfind` for each.
* `admin` deletes the created users.

The test runs `N` times for each user. For example, if you define `--vus 2` and `--iterations 5`, the testing steps as a whole will run 10 times (5 times per user).


## Available options

* [Shared options](/k6-tests/options)
* `FOLDER_ROOT_COUNT`: number of root folders to create
  * default value: `5`
  * `export FOLDER_ROOT_COUNT=10`
* `FOLDER_CHILD_COUNT`: number of child folders to create for each root folder
  * default value: `5`
  * `export FOLDER_CHILD_COUNT=10`


## How to run the test

please read [here](/k6-tests/run) how the test can be executed, only the script is different

