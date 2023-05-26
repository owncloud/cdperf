# Description

The `040 create upload rename delete folder and file` test creates a folder in the user's personal space, the user then uploads a file to it, renames the created folder and deletes it again.
In 10% of the iterations the large file is uploaded, in 30% of the iterations the medium resource and otherwise the small resource.

## Procedure

* each `user` logs into the system individually.
* each `user iteration` creates a folder.
* each `user iteration` uploads a resource into that folder.
* each `user iteration` renames the folder.
* each `user iteration` deletes the folder.

the test runs `N` times for each user, for example if you define `--vus 2` and `--iterations 5`
the testing steps as a whole will run 10 times (5 times per user).


## Available options

* [Shared options](/k6-tests/src/values/env)


## How to run the test

please read [here](/k6-tests/docs/run) how the test can be executed, only the script is different
