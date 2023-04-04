## Description
The `navigate file tree` test is intended to see how the instance behaves when many users move through a configurable deep folder hierarchy at the same time. Since k6 does not use a browser for the tests, a propfind for each folder to simulate the client behavior is used. 

* `admin` creates `N` users.
  * `N` can be set by using the k6 `--vus` option.
  * by default, it set to 1.
* each `user` create a folder tree of with `W` and depth `D`.
  * `W` can be set with the environment variable `FOLDER_ROOT_COUNT`.
  * `D` can be set with the environment variable `FOLDER_CHILD_COUNT`.
* each `user` logs into the system individually.
* each `user` loops through the folder tree and sends a `propfind` for each.
* `admin` deletes the created users.

The test runs `N` times for each user. For example, if you define `--vus 2` and `--iterations 5`, the testing steps as a whole will run 10 times (5 times per user).

## Options
* `BASE_URL`: the host under which the respective cloud can be reached.
  * default value: `https://localhost:9200`
  * `export BASE_URL=https://cloud-domain.org:80`
* `AUTH_ADAPTER`: the authentication method to use
  * default value: `openIDConnect`
  * `export AUTH_ADAPTER=openIDConnect`
  * `export AUTH_ADAPTER=basicAuth`
* `CLIENT_VERSION`: specifies which client version should be used
  * default value: `ocis`
  * `export CLIENT_VERSION=ocis`
  * `export CLIENT_VERSION=occ`
  * `export CLIENT_VERSION=nc`
* `ADMIN_LOGIN`: the login name of an administrative user
  * default value: `admin`
  * `export ADMIN_LOGIN=main`
* `ADMIN_PASSWORD`: the login password of that administrative user
  * default value: `admin`
  * `export ADMIN_PASSWORD=secret`
* `FOLDER_ROOT_COUNT`: number of root folders to create
  * default value: `5`
  * `export FOLDER_ROOT_COUNT=10`
* `FOLDER_CHILD_COUNT`: number of child folders to create for each root folder
  * default value: `5`
  * `export FOLDER_CHILD_COUNT=10`
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
CLIENT_VERSION=occ \
AUTH_ADAPTER=basicAuth \
ADMIN_LOGIN=main \
ADMIN_PASSWORD=secret \
k6 run artifacts/koko-020-navigate-file-tree.js --vus 2 --iterations 5

# run the test on a host with an ocis server
BASE_URL=https://cloud-domain.org:80 \
ADMIN_LOGIN=main \
ADMIN_PASSWORD=secret \
k6 run artifacts/koko-020-navigate-file-tree.js --vus 2 --iterations 5
```

The same can be reached with docker:
```shell
docker run -e BASE_URL=https://cloud-domain.org:80 -e CLIENT_VERSION=occ -e AUTH_ADAPTER=basicAuth -e ADMIN_LOGIN=main -e ADMIN_PASSWORD=secret --rm -i grafana/k6 run --vus 2 - < artifacts/koko-020-navigate-file-tree.js
```
