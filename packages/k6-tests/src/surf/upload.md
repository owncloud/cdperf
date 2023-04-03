## Description
The `upload` test mimics a typical end user resource uploading scenario.

The test idea originally came from [surf](https://www.surf.nl/), where the process was used to compare the individual cloud platforms.

Each user loads an adjustable number of files with an adjustable file size into his home folder

* `admin` creates `N` users.
	* `N` can be set with the k6 `--vus` option.
	* by default, it set to 1.
* each `user` logs into the system individually.
* each `user` uploads `10` files with a size of `1mb` each into their home folder.
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
BASE_URL=https://cloud-domain.org:80 \
API_VERSION=legacy \
AUTH_ADAPTER=basicAuth \
ADMIN_LOGIN=main \
ADMIN_PASSWORD=secret \
k6 run artifacts/surf-upload.js --vus 2 --iterations 5

# run the test on a host with an ocis server
BASE_URL=https://cloud-domain.org:80 \
ADMIN_LOGIN=main \
ADMIN_PASSWORD=secret \
k6 run artifacts/surf-upload.js --vus 2 --iterations 5
```

The same can be reached with docker:
```shell
docker run -e BASE_URL=https://cloud-domain.org:80 -e API_VERSION=legacy -e AUTH_ADAPTER=basicAuth -e ADMIN_LOGIN=main -e ADMIN_PASSWORD=secret --rm -i grafana/k6 run --vus 2 - < artifacts/surf-upload.js
```
