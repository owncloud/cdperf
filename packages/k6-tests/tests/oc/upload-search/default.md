# Description

The `upload search` test mimics a typical end user resource search scenario.

Each user uploads a file and searches a particular word in that file.

**NOTE**: A search extractor is required to be configured in the oCIS instance in order to extract the word from the file, otherwise the search won't find the word and the test will fail.


## Procedure

* `admin` creates `N` users.
  * `N` can be set with the `--vus` option.
  * by default, it set to 1.
* each `user` logs into the system individually.
* each `user` uploads a particular file containing the `automatically` word to the `initial/file.docx` path. This happens during the setup phase.
* each `user` searches for the `automatically` word inside his root folder.
* `admin` deletes the created users.

Note that the setup phase will wait for 10 seconds (configurable) to ensure that the file is uploaded and indexed before the search is executed.

The iterations are shared among the users, so if you define `--iterations 5` and `--vus 2`, the test will run 5 times in total, within the 2 users running in parallel.
In other words, 2 users will run the tests in parallel until the 5 iterations are completed.


## Available options

* [Shared options](/k6-tests/src/values/env)
* `SLEEP_TIME`: time to wait after the setup to allow indexing the file. Not giving enough time can cause the tests to fail.
  * default value: `10` (seconds)
  * `export SLEEP_TIME=12`


## How to run the test

please read [here](/k6-tests/docs/run) how the test can be executed, only the script is different
