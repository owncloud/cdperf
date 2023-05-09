# Description

The `share upload rename` test mimics a typical end user resource sharing scenario.

The admin user shares a parent folder with each of his colleagues, who in turn create a folder
in the received share per iteration and user then uploads a fixed number of files.
To finish, the folder in which the files are located is renamed by each user.


## Procedure

* `admin` creates `N` users.
  * `N` can be set with the `--vus` option.
  * by default, it set to 1.
* `admin` creates a folder `oc-share-upload-rename`.
* `admin` shares that folder to each of the users.
* each `user` logs into the system individually.
* each `user` creates a folder `$ITERATION-initial-$USERNAME` inside the received share.
* each `user` uploads `10` files with a size of `1mb` each into this folder.
* each `user` renames the folder `$ITERATION-initial-$USERNAME` to `$ITERATION-final-$USERNAME`.
* `admin` deletes the `oc-share-upload-rename` folder.
* `admin` deletes the created users.

the test runs `N` times for each user, for example if you define `--vus 2` and `--iterations 5`
the testing steps as a whole will run 10 times (5 times per user).


## Available options

* [Shared options](/k6-tests/options)
* `TEST_FOLDER`: test root folder name
  * default value: `oc-share-upload-rename`
  * `export TEST_FOLDER=your-share-upload-rename-folder-name`
* `ASSET_SIZE`: size of the individual asset in kb
  * default value: `1000`
  * `export ASSET_SIZE=2000`
* `ASSET_QUANTITY`: number of assets to be uploaded
  * default value: `10`
  * `export ASSET_QUANTITY=20`


## How to run the test

please read [here](/k6-tests/run) how the test can be executed, only the script is different
