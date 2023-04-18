## Description
The `add remove user share` test creates a configurable amount of share receivers (users) and one folder per vu,
once the provisioning is done, the user shares the created folder with each share receiver 
and then un-shares that folder at the test end.

* `admin` creates `N` users.
  * `N` can be set by using the k6 `--vus` option.
  * by default, it set to 1.
* `admin` creates `N` share receiver users.
  * `N` can be set with the environment variable `SHARE_RECEIVERS_USER_COUNT`.
* each `user` creates 1 sharing folder.
* each `user` logs into the system individually.
* each `user` shares the folder every share receiver.
* each `user` un-shares the folder every share receiver.
* `admin` deletes the created users.
* `admin` deletes the created share receiver users.

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
* `SHARE_RECEIVERS_USER_COUNT`: number of share user receivers to create
  * default value: `35`
  * `export SHARE_RECEIVERS_USER_COUNT=70`
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
k6 run artifacts/090-add-remove-user-share.js --vus 2 --iterations 5

# run the test on a host with an ocis server
BASE_URL=https://cloud-domain.org:80 \
ADMIN_LOGIN=main \
ADMIN_PASSWORD=secret \
k6 run artifacts/090-add-remove-user-share.js --vus 2 --iterations 5
```

The same can be reached with docker:
```shell
docker run -e BASE_URL=https://cloud-domain.org:80 -e CLIENT_VERSION=occ -e AUTH_ADAPTER=basicAuth -e ADMIN_LOGIN=main -e ADMIN_PASSWORD=secret --rm -i grafana/k6 run --vus 2 - < artifacts/090-add-remove-user-share.js
```
