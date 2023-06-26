# Description

The `100 add remove tag` test picks a random file or folder and assigns a tag to it.
In 50% of the iterations tag gets assigned to a folder, for the rest it assigns it to the file.


## Procedure

* each `user` logs into the system individually.
* each `user iteration` assigns a tag to the resource.

the test runs `N` times for each user, for example if you define `--vus 2` and `--iterations 5`
the testing steps as a whole will run 10 times (5 times per user).


## Available options

* [Shared options](/k6-tests/src/values/env)


## How to run the test

please read [here](/k6-tests/docs/run) how the test can be executed, only the script is different
