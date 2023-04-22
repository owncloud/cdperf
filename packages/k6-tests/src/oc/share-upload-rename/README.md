## Description
The `share upload rename` test mimics a typical end user resource sharing scenario.

The admin user shares a parent folder with each of his colleagues, who in turn create a folder
in the received share per iteration and user then uploads a fixed number of files.
To finish, the folder in which the files are located is renamed by each user.

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
* `TEST_FOLDER`: test root folder name
  * default value: `oc-share-upload-rename`
  * `export TEST_FOLDER=your-share-upload-rename-folder-name`
* `ASSET_SIZE`: size of the individual asset in kb
  * default value: `1000`
  * `export ASSET_SIZE=2000`
* `ASSET_QUANTITY`: number of assets to be uploaded
  * default value: `10`
  * `export ASSET_QUANTITY=20`
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
k6 run artifacts/oc-share-upload-rename-base-test.js --vus 2 --iterations 5

# run the test on a host with an ocis server
PLATFORM_URL=https://cloud-domain.org:80 \
ADMIN_LOGIN=main \
ADMIN_PASSWORD=secret \
k6 run artifacts/oc-share-upload-rename-base-test.js --vus 2 --iterations 5
```

The same can be reached with docker:
```shell
docker run -e PLATFORM_URL=https://cloud-domain.org:80 -e PLATFORM=ownCloudServer -e AUTH_ADAPTER=basicAuth -e ADMIN_LOGIN=main -e ADMIN_PASSWORD=secret --rm -i grafana/k6 run --vus 2 - < artifacts/oc-share-upload-rename-base-test.js
```
