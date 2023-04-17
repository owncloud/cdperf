## Description
The `upload delete` test is intended to see how the instance behaves when many users upload N files of size S, M and L each, and then deletes them again.

* `admin` creates `N` users.
  * `N` can be set by using the k6 `--vus` option.
  * by default, it set to 1.
* each `user` uploads `N` resources of size `S`.
  * `N` can be set with the environment variable `ASSET_SMALL_QUANTITY`.
  * `S` can be set with the environment variable `ASSET_SMALL_SIZE`.
* each `user` uploads `N` resources of size `M`.
  * `N` can be set with the environment variable `ASSET_MEDIUM_QUANTITY`.
  * `S` can be set with the environment variable `ASSET_MEDIUM_SIZE`.
* each `user` uploads `N` resources of size `L`.
  * `N` can be set with the environment variable `ASSET_LARGE_QUANTITY`.
  * `S` can be set with the environment variable `ASSET_LARGE_SIZE`.
* each `user` logs into the system individually.
* each `user` deletes his set of files.
* `admin` deletes the created users.

the test runs `N` times for each user, for example if you define `--vus 2` and `--iterations 5`
the testing steps as a whole will run 10 times (5 times per user).

## Options
* `BASE_URL`: the host under which the respective cloud can be reached.
  * default value: `https://localhost:9200`
  * `export BASE_URL=https://cloud-domain.org:80`
* `AUTH_ADAPTER`: the authentication method to use
  * default value: `kopano`
  * `export AUTH_ADAPTER=kopano`
  * `export AUTH_ADAPTER=basicAuth`
* `PLATFORM`: specifies which client platform should be used
  * default value: `ownCloudInfiniteScale`
  * `export PLATFORM=ownCloudInfiniteScale`
  * `export PLATFORM=ownCloudServer`
  * `export PLATFORM=nextcloud`
* `ADMIN_LOGIN`: the login name of an administrative user
  * default value: `admin`
  * `export ADMIN_LOGIN=main`
* `ADMIN_PASSWORD`: the login password of that administrative user
  * default value: `admin`
  * `export ADMIN_PASSWORD=secret`
* `FOLDER_ROOT_COUNT`: number of root folders to create
  * default value: `5`
  * `export FOLDER_ROOT_COUNT=10`
* `ASSET_SMALL_SIZE`: size of asset S as kb
  * default value: `10`
  * `export ASSET_SMALL_SIZE=20`
* `ASSET_SMALL_QUANTITY`: number uploads of that asset
  * default value: `1`
  * `export ASSET_SMALL_QUANTITY=2`
* `ASSET_MEDIUM_SIZE`: size of asset M as kb
  * default value: `100`
  * `export ASSET_MEDIUM_SIZE=200`
* `ASSET_MEDIUM_QUANTITY`: number uploads of that asset
  * default value: `1`
  * `export ASSET_MEDIUM_QUANTITY=2`
* `ASSET_LARGE_SIZE`: size of asset L as kb
  * default value: `1000`
  * `export ASSET_LARGE_SIZE=2000`
* `ASSET_LARGE_QUANTITY`: number uploads of that asset
  * default value: `1`
  * `export ASSET_LARGE_QUANTITY=2`
* `--vus`: number of virtual users
  * default value: `1`
  * `k6 ... --vus 2`
* `--duration`: test duration limit
  * `k6 ... --duration 10s`
* `--iterations`: script total iteration limit (among all VUs)
  * `k6 ... --iterations 5`

## Examples
```shell
# run the test on a host with an ownCloud classic server
BASE_URL=https://cloud-domain.org:80 \
PLATFORM=ownCloudServer \
AUTH_ADAPTER=basicAuth \
ADMIN_LOGIN=main \
ADMIN_PASSWORD=secret \
k6 run artifacts/koko-040-upload-delete.js --vus 2 --iterations 5

# run the test on a host with an ocis server
BASE_URL=https://cloud-domain.org:80 \
ADMIN_LOGIN=main \
ADMIN_PASSWORD=secret \
k6 run artifacts/koko-040-upload-delete.js --vus 2 --iterations 5
```

The same can be reached with docker:
```shell
docker run -e BASE_URL=https://cloud-domain.org:80 -e PLATFORM=ownCloudServer -e AUTH_ADAPTER=basicAuth -e ADMIN_LOGIN=main -e ADMIN_PASSWORD=secret --rm -i grafana/k6 run --vus 2 - < artifacts/koko-040-upload-delete.js
```
