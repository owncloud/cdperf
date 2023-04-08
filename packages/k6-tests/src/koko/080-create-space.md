## Description
The `create space` test creates a configurable amount of spaces (per user) and deletes each at the end.

* `admin` creates `N` users.
  * `N` can be set by using the k6 `--vus` option.
  * by default, it set to 1.
* `admin` assigns the `spaceadmin`role to each user.
* each `user` logs into the system individually.
* each `user` creates `N` spaces.
  * `N` can be set with the environment variable `SPACE_COUNT`.
* each `user` deletes the created spaces to finalize the test.
* `admin` deletes the created users.

the test runs `N` times for each user, for example if you define `--vus 2` and `--iterations 5`
the testing steps as a whole will run 10 times (5 times per user).

## Compatibility
* :white_check_mark: ownCloud Infinite Scale
* :x: ownCloud Server
* :x: Nextcloud

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
* `SPACE_COUNT`: number spaces to create
  * default value: `2`
  * `export SPACE_COUNT=4`
* `--vus`: number of virtual users
  * default value: `1`
  * `k6 ... --vus 2`
* `--duration`: test duration limit
  * `k6 ... --duration 10s`
* `--iterations`: script total iteration limit (among all VUs)
  * `k6 ... --iterations 5`

## Examples
```shell
# run the test on a host with an ocis server
BASE_URL=https://cloud-domain.org:80 \
ADMIN_LOGIN=main \
ADMIN_PASSWORD=secret \
k6 run artifacts/080-create-space.js --vus 2 --iterations 5
```

The same can be reached with docker:
```shell
docker run -e BASE_URL=https://cloud-domain.org:80 -e ADMIN_LOGIN=main -e ADMIN_PASSWORD=secret --rm -i grafana/k6 run --vus 2 - < artifacts/080-create-space.js
```
