# Description

The `kitchen sink` test is intended to demonstrate the whole api and client from our k6-tdk (k6 test development kit).
The test does not follow any user story, it is a good starting point to get inspired how the framework can be used.

the test runs `N` times for each user, for example if you define `--vus 2` and `--iterations 5`
the testing steps as a whole will run 10 times (5 times per user).

## Available options

* [Shared options](/k6-tests/options)


## How to run the test

please read [here](/k6-tests/run) how the test can be executed, only the script is different
