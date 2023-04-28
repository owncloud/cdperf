# Options

all cdPerf tests share a set of options, what these are and what they do is listed below


<!--- -->

## ENV `PLATFORM_URL`

the host under which the respective cloud can be reached.

* default value: `https://localhost:9200`
* `export PLATFORM_URL=https://cloud-domain.org`


<!--- -->

## ENV `AUTH_N_PROVIDER`

the authentication method to use

* default value: `kopano`
* `export AUTH_N_PROVIDER=keycloak`
* `export AUTH_N_PROVIDER=kopano`
* `export AUTH_N_PROVIDER=basicAuth`


<!--- -->

## ENV `KEYCLOAK_REALM`

defines the keycloak realm, only necessary if `AUTH_N_PROVIDER` is set to `keycloak`

* `export KEYCLOAK_REALM=ocis`


<!--- -->

## ENV `KEYCLOAK_URL`

indicates under which url keycloak can be reached, only necessary if `AUTH_N_PROVIDER` is set to `keycloak`

* `export KEYCLOAK_URL=https://keycloak.cloud-domain.org/auth/`


<!--- -->

## ENV `KEYCLOAK_REDIRECT_URL`

specifies the redirect url, only necessary if `AUTH_N_PROVIDER` is set to `keycloak`

* `export KEYCLOAK_REDIRECT_URL=https://cloud-domain.org/oidc-callback.html`


<!--- -->

## ENV `KOPANO_URL`

indicates under which url kopano can be reached, only necessary if `AUTH_N_PROVIDER` is set to `keycloak`

* default value: `https://localhost:9200`
* `export KEYCLOAK_URL=https://keycloak.cloud-domain.org/auth/`


<!--- -->

## ENV `KOPANO_REDIRECT_URL`

specifies the redirect url, only necessary if `AUTH_N_PROVIDER` is set to `keycloak`

* default value: `https://localhost:9200/oidc-callback.html`
* `export KOPANO_REDIRECT_URL=https://cloud-domain.org/oidc-callback.html`


<!--- -->

## ENV `PLATFORM`

specifies which client platform should be used

* default value: `ownCloudInfiniteScale`
* `export PLATFORM=ownCloudInfiniteScale`
* `export PLATFORM=ownCloudServer`
* `export PLATFORM=nextcloud`


<!--- -->

## ENV `ADMIN_LOGIN`

the login name of an administrative user

* default value: `admin`
* `export ADMIN_LOGIN=main`


<!--- -->

## ENV `ADMIN_PASSWORD`

the login password of that administrative user

* default value: `admin`
* `export ADMIN_PASSWORD=secret`


<!--- -->

## K6 option `--vus`

number of virtual users

* default value: `1`
* `k6 ... --vus 2`


<!--- -->

## K6 option `--iterations`

total iteration limit (among all VUs)

* `k6 ... --iterations 5`

<!--- -->

## K6 option `--duration`

test duration limit

* `k6 ... --duration 10s`
