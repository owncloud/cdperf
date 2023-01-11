## Description
The `share upload rename` tests mimics a typical end user resource sharing scenario by the following steps.

* `admin` creates `N` users.
  * `N` can be set by using the k6 `--vus` option.
  * by default, it set to 5.
* `admin` creates a folder `share-upload-rename-default`.
* `admin` shares that folder to each of the users.
* each `user` logs into the system individually.
* each `user` creates a folder `$ITERATION-initial-$USERNAME` inside the received share.
* each `user` uploads `10` files with a size of `1mb` each into this folder.
* each `user` renames the folder `$ITERATION-initial-$USERNAME` to `$ITERATION-final-$USERNAME`.
* `admin` deletes the `share-upload-rename-default` folder.
* `admin` deletes every user.

the test runs `N` times for each user, for example if you define `--vus 2` and `--iterations 5`
the testing steps as a whole will run 10 times (5 times per user).

## Options
* `BASE_URL`: the host under which the respective cloud can be reached.
  * default value: `https://localhost:9200`
  * `export BASE_URL=https://cloud-domain.org:80`
* `AUTH_ADAPTER`: the authentication method to use
  * default value: `openIDConnect`
  * `export AUTH_ADAPTER=openIDConnect`
  * `export AUTH_ADAPTER=basicAuth`
* `API_VERSION`: specifies which cloud api version should be used
	* default value: `legacy`
	* `export API_VERSION=legacy`
	* `export API_VERSION=latest`
* `ADMIN_LOGIN`: the login name of an administrative user
	* default value: `admin`
	* `export ADMIN_LOGIN=main`
* `ADMIN_PASSWORD`: the login password of that administrative user
	* default value: `admin`
	* `export ADMIN_PASSWORD=secret`
* `--vus`: specifies how many virtual users are testing at the same time
	* default value: `5`
	* `k6 ... --vus 2`
* `--iterations`: indicates how often an individual user repeats the test
	* default value: `50`
	* `k6 ... --iterations 5`

## Examples
```shell
$ # run the test on a host with an ownCloud classic server
$ BASE_URL=https://cloud-domain.org:80 \
$ API_VERSION=legacy \
$ AUTH_ADAPTER=basicAuth \
$ ADMIN_LOGIN=main \
$ ADMIN_PASSWORD=secret \
$ k6 run run/share-upload-rename-default.js --vus 2 --iterations 5
$
$ # run the test on a host with an ocis server
$ BASE_URL=https://cloud-domain.org:80 \
$ ADMIN_LOGIN=main \
$ ADMIN_PASSWORD=secret \
$ k6 run run/share-upload-rename-default.js --vus 2 --iterations 5
```