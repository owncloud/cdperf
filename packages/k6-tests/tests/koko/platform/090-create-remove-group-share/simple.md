# Description

The `090 create remove group share` test creates a folder, shares that with random picked group, removes the share again and deletes the folder.


## Procedure

* each `user` logs into the system individually.
* each `user iteration` creates a folder.
* each `user iteration` sends a propfind request.
* each `user iteration` shares that folder with a random group.
* each `user iteration` removes that share.
* each `user iteration` deletes the folder.

the test runs `N` times for each user, for example if you define `--vus 2` and `--iterations 5`
the testing steps as a whole will run 10 times (5 times per user).


## Available options

* [Shared options](/k6-tests/src/values/env)


## How to run the test

please read [here](/k6-tests/docs/run) how the test can be executed, only the script is different
