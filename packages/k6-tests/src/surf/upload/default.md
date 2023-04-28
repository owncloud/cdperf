# Description

The `upload` test mimics a typical end user resource uploading scenario.

The test idea originally came from [surf](https://www.surf.nl/), where the process was used to compare the individual cloud platforms.

Each user loads an adjustable number of files with an adjustable file size into his home folder


## Procedure

* `admin` creates `N` users.
	* `N` can be set with the k6 `--vus` option.
	* by default, it set to 1.
* each `user` logs into the system individually.
* each `user` uploads `10` files with a size of `1mb` each into their home folder.
* `admin` deletes the created users.

the test runs `N` times for each user, for example if you define `--vus 2` and `--iterations 5`
the testing steps as a whole will run 10 times (5 times per user).


## Available options

* [Shared options](/k6-tests/options)
* `ASSET_SIZE`: size of the individual asset in kb
	* default value: `1000`
	* `export ASSET_SIZE=2000`
* `ASSET_QUANTITY`: number of assets to be uploaded
	* default value: `10`
	* `export ASSET_QUANTITY=20`


## How to run the test

please read [here](/k6-tests/run) how the test can be executed, only the script is different
