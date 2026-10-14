# Description

The `upload search` test mimics a typical end user resource search scenario.

While the `default` test just focuses on searching, this test also includes the upload part. The test will just upload a file and search it, but it will only check the status code of the search request. This means that the search will likely will return empty results (not indexed yet) and the test will pass.

The test is expected to perform worse than the `default` test, as it includes the upload part. There are also additional write locks on the index, due to the indexing operation, that are expected to slow down the test. Note that we won't wait for the indexing to finish in order to send the search request.


## Procedure

* `admin` creates `N` users.
  * `N` can be set with the `--vus` option.
  * by default, it set to 1.
* each `user` logs into the system individually.
* each `user` uploads a particular file in the `initial` folder. The file is uploaded with a random name.
* each `user` searches for the filename inside his root folder.
* `admin` deletes the created users.

The iterations are shared among the users, so if you define `--iterations 5` and `--vus 2`, the test will run 5 times in total, within the 2 users running in parallel.
In other words, 2 users will run the tests in parallel until the 5 iterations are completed.


## Available options

* [Shared options](/k6-tests/src/values/env)


## How to run the test

please read [here](/k6-tests/docs/run) how the test can be executed, only the script is different
