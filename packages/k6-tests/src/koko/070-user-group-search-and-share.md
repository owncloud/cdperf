## Description
The `user group search and share` test creates a configurable amount of share receivers (users and groups),
folders and files, once the provisioning is done, the users search for all share receivers (users and groups),
and then shares the provisioned resources with each.

To confirm that everything went well, the test compares the resolved share recipient with initial share receiver. 

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
k6 run artifacts/030-search-for-filename.js --vus 2 --iterations 5

# run the test on a host with an ocis server
BASE_URL=https://cloud-domain.org:80 \
ADMIN_LOGIN=main \
ADMIN_PASSWORD=secret \
k6 run artifacts/030-search-for-filename.js --vus 2 --iterations 5
```

The same can be reached with docker:
```shell
docker run -e BASE_URL=https://cloud-domain.org:80 -e CLIENT_VERSION=occ -e AUTH_ADAPTER=basicAuth -e ADMIN_LOGIN=main -e ADMIN_PASSWORD=secret --rm -i grafana/k6 run --vus 2 - < artifacts/030-search-for-filename.js
```
