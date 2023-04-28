# Description

The `add remove tag` test creates a configurable amount of files and folders for each user iteration,
after the resources are created, the user assigns a tag to each of the files and confirms via 
propfind that the tag is added. After that, the per-user teardown removes the tag,
deletes the created resources and tags.


## Procedure

* `admin` creates `N` users.
  * `N` can be set by using the k6 `--vus` option.
  * by default, it set to 1.
* each `user` creates `N` folders.
  * `N` can be set with the environment variable `ASSETS_FOLDER_COUNT`.
* each `user` creates `N` txt documents.
  * `N` can be set with the environment variable `ASSETS_TEXT_DOCUMENT_COUNT`.
* each `user` assigns one unique tag to each folder and txt document.
* each `user` un-assigns that tag from each folder and txt document.
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
