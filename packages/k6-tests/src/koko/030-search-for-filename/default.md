# Description

The `search for filename` test creates a configurable amount of files and folders for each user,
after that, the test searches for each of these resources using their filenames. 


## Procedure

* `admin` creates `N` users.
  * `N` can be set by using the k6 `--vus` option.
  * by default, it set to 1.
* each `user` logs into the system individually.
* each `user` creates `N` folders.
  * `N` can be set with the environment variable `ASSETS_FOLDER_COUNT`.
* each `user` sends a propfind for each folder to get it's fileid.
* each `user` sends a search request for that txt file name and compares
  the resulting search document id with the propfind result before.
* each `user` creates `N` txt files.
  * `N` can be set with the environment variable `ASSETS_TEXT_DOCUMENT_COUNT`.
* each `user` sends a propfind for each txt file to get it's fileid.
* each `user` sends a search request for that txt file name and compares
  the resulting search document id with the propfind result before.
* each `user` deletes the created files and folders to finalize the test.
* `admin` deletes the created users.

the test runs `N` times for each user, for example if you define `--vus 2` and `--iterations 5`
the testing steps as a whole will run 10 times (5 times per user).


## Available options

* [Shared options](/k6-tests/options)
* `ASSETS_FOLDER_COUNT`: number of folders to create
  * default value: `2`
  * `export ASSETS_FOLDER_COUNT=5`
* `ASSETS_TEXT_DOCUMENT_COUNT`: number of txt files to create
  * default value: `2`
  * `export ASSETS_TEXT_DOCUMENT_COUNT=5`


## How to run the test

please read [here](/k6-tests/run) how the test can be executed, only the script is different
