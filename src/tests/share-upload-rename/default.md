## Description
The `share upload rename default` test mimics a typical end user resource sharing scenario.

The admin user shares a parent folder with each of his colleagues, who in turn create a folder
in the received share per iteration and user then uploads a fixed number of files.
To finish, the folder in which the files are located is renamed by each user.

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
* `admin` deletes the created users.

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
	* default value: `latest`
	* `export API_VERSION=legacy`
	* `export API_VERSION=latest`
* `ADMIN_LOGIN`: the login name of an administrative user
	* default value: `admin`
	* `export ADMIN_LOGIN=main`
* `ADMIN_PASSWORD`: the login password of that administrative user
	* default value: `admin`
	* `export ADMIN_PASSWORD=secret`
* `ASSET_SIZE`: size of the individual asset in Kilobyte
	* default value: `1024`
	* `export ASSET_SIZE=2048`
* `ASSET_QUANTITY`: number of assets to be uploaded
	* default value: `10`
	* `export ASSET_QUANTITY=20`
* `--vus`: specifies how many virtual users are testing at the same time
	* default value: `5`
	* `k6 ... --vus 2`
* `--iterations`: indicates how often an individual user repeats the test
	* default value: `50`
	* `k6 ... --iterations 5`

## Examples
```shell
# run the test on a host with an ownCloud classic server
BASE_URL=https://cloud-domain.org:80 \
API_VERSION=legacy \
AUTH_ADAPTER=basicAuth \
ADMIN_LOGIN=main \
ADMIN_PASSWORD=secret \
k6 run run/share-upload-rename-default.js --vus 2 --iterations 5

# run the test on a host with an ocis server
BASE_URL=https://cloud-domain.org:80 \
ADMIN_LOGIN=main \
ADMIN_PASSWORD=secret \
k6 run run/share-upload-rename-default.js --vus 2 --iterations 5
```

The same can be archieved with docker:
```shell
docker run -e BASE_URL=https://cloud-domain.org:80 -e API_VERSION=legacy -e AUTH_ADAPTER=basicAuth -e ADMIN_LOGIN=main -e ADMIN_PASSWORD=secret --rm -i grafana/k6 run --vus 2 - < run/share-upload-rename-default.js
```
