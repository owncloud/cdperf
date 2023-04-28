# Description

The `user group search and share` test creates a configurable amount of share receivers (users and groups),
folders and files, once the provisioning is done, the users search for all share receivers (users and groups),
and then shares the provisioned resources with each.

To confirm that everything went well, the test compares the resolved share recipient with initial share receiver. 


## Procedure

* `admin` creates `N` users.
  * `N` can be set by using the k6 `--vus` option.
  * by default, it set to 1.
* `admin` creates `N` share receiver groups.
  * `N` can be set with the environment variable `SHARE_RECEIVERS_GROUP_COUNT`.
* `admin` creates `N` share receiver users.
  * `N` can be set with the environment variable `SHARE_RECEIVERS_USER_COUNT`.
* each `user` logs into the system individually.
* each `user` creates `N` folders.
  * `N` can be set with the environment variable `ASSETS_FOLDER_COUNT`.
* each `user` searches for each share receiver.
* each `user` shares each folder to all share receivers.
* each `user` creates `N` txt files.
  * `N` can be set with the environment variable `ASSETS_TEXT_DOCUMENT_COUNT`.
* each `user` searches for each share receiver.
* each `user` shares each txt file to all share receivers.
* each `user` deletes the created files and folders to finalize the test.
* `admin` deletes the created users.
* `admin` deletes the created share receiver users.
* `admin` deletes the created share receiver groups.

the test runs `N` times for each user, for example if you define `--vus 2` and `--iterations 5`
the testing steps as a whole will run 10 times (5 times per user).


## Available options

* [Shared options](/k6-tests/options)
* `SHARE_RECEIVERS_GROUP_COUNT`: number of share group receivers to create
  * default value: `1`
  * `export SHARE_RECEIVERS_GROUP_COUNT=1`
* `SHARE_RECEIVERS_USER_COUNT`: number of share user receivers to create
  * default value: `1`
  * `export SHARE_RECEIVERS_USER_COUNT=1`
* `ASSETS_FOLDER_COUNT`: number of folders to create
  * default value: `1`
  * `export ASSETS_FOLDER_COUNT=1`
* `ASSETS_TEXT_DOCUMENT_COUNT`: number of txt files to create
  * default value: `1`
  * `export ASSETS_TEXT_DOCUMENT_COUNT=2`


## How to run the test

please read [here](/k6-tests/run) how the test can be executed, only the script is different
