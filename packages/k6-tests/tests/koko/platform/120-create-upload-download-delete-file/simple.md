# Description

The `120 create upload download delete file` test creates a folder in the user's personal space, the user then uploads a large file to it, download the file and deletes them.

## Procedure

* each `user` logs into the system individually.
* each `user iteration` creates a folder.
* each `user iteration` uploads a resource into that folder.
* each `user iteration` download the resource.
* each `user iteration` deletes the folder.

the test runs `N` times for each user, for example if you define `--vus 2` and `--iterations 5`
the testing steps as a whole will run 10 times (5 times per user).


## Available options

* [Shared options](/k6-tests/src/values/env)


## How to run the test

please read [here](/k6-tests/docs/run) how the test can be executed, only the script is different
