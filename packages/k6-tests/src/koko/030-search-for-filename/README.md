# Description
The `search for filename` test creates a configurable amount of files and folders for each user,
after that, the test searches for each of these resources using their filenames. 

* `admin` creates `N` users.
  * `N` can be set by using the k6 `--vus` option.
  * by default, it set to 1.
* each `user` logs into the system individually.
* each `user` creates `N` folders.
  * `N` can be set with the environment variable `ASSETS_FOLDER_COUNT`.
* each `user` sends a propfind for each folder to get it's fileid.
* each `user` sends a search request for that txt file name and compares
  the resulting search document id with the propfind result before.
* each `user` creates `N` txt files.
  * `N` can be set with the environment variable `ASSETS_TEXT_DOCUMENT_COUNT`.
* each `user` sends a propfind for each txt file to get it's fileid.
* each `user` sends a search request for that txt file name and compares
  the resulting search document id with the propfind result before.
* each `user` deletes the created files and folders to finalize the test.
* `admin` deletes the created users.

the test runs `N` times for each user, for example if you define `--vus 2` and `--iterations 5`
the testing steps as a whole will run 10 times (5 times per user).

## Options
* `PLATFORM_URL`: the host under which the respective cloud can be reached.
  * default value: `https://localhost:9200`
  * `export PLATFORM_URL=https://cloud-domain.org:80`
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
* `ASSETS_FOLDER_COUNT`: number of folders to create
  * default value: `2`
  * `export ASSETS_FOLDER_COUNT=5`
* `ASSETS_TEXT_DOCUMENT_COUNT`: number of txt files to create
  * default value: `2`
  * `export ASSETS_TEXT_DOCUMENT_COUNT=5`
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
PLATFORM_URL=https://cloud-domain.org:80 \
PLATFORM=ownCloudServer \
AUTH_ADAPTER=basicAuth \
ADMIN_LOGIN=main \
ADMIN_PASSWORD=secret \
k6 run artifacts/030-search-for-filename-default-test.js --vus 2 --iterations 5

# run the test on a host with an ocis server
PLATFORM_URL=https://cloud-domain.org:80 \
ADMIN_LOGIN=main \
ADMIN_PASSWORD=secret \
k6 run artifacts/030-search-for-filename-default-test.js --vus 2 --iterations 5
```

The same can be reached with docker:
```shell
docker run -e PLATFORM_URL=https://cloud-domain.org:80 -e PLATFORM=ownCloudServer -e AUTH_ADAPTER=basicAuth -e ADMIN_LOGIN=main -e ADMIN_PASSWORD=secret --rm -i grafana/k6 run --vus 2 - < artifacts/030-search-for-filename-default-test.js
```
