# Options

all cdPerf tests share a set of options, what these are and what they do is listed below

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

## ENV `SLEEP_AFTER_REQUEST`

most tests can pause after a request was made, this option defines the duration

* default value: `0.2`
* `export SLEEP_AFTER_REQUEST=1`


<!--- -->

## ENV `SLEEP_AFTER_ITERATION`

most tests can pause after the iteration has finished, this option defines the duration

* default value: `0`
* `export SLEEP_AFTER_ITERATION=1`


<!--- -->

## ENV `SEED_CONTAINER_NAME`

name of the container that stores the test dummy data. This is used for the seed data scripts to hydrate the platform with data.

* default value: `cdperf`
* `export SEED_CONTAINER_NAME=anyName`


<!--- -->

## ENV `SEED_CONTAINER_TYPE`

not every platform supports every container type. This option can be used to decide which type of container is used

* default value for ownCloudInfiniteScale: `space`
* `export SEED_CONTAINER_TYPE=space`
* `export SEED_CONTAINER_TYPE=directory`


<!--- -->

## ENV `SEED_USERS_CREATE`

specifies whether the seed test should create the users or not

* default value: `true`
* `export SEED_USERS_CREATE=false`


<!--- -->

## ENV `SEED_USERS_DELETE`

specifies whether the seed test should delete the users or not

* default value: `true`
* `export SEED_USERS_DELETE=false`


<!--- -->

## ENV `SEED_USERS_TOTAL`

specifies how many users should be created or deleted

* default value: `25`
* `export SEED_USERS_TOTAL=50`


<!--- -->

## ENV `SEED_GROUPS_CREATE`

specifies whether the seed test should create the groups or not

* default value: `true`
* `export SEED_GROUPS_CREATE=false`


<!--- -->

## ENV `SEED_GROUPS_DELETE`

specifies whether the seed test should delete the groups or not

* default value: `true`
* `export SEED_GROUPS_DELETE=false`


<!--- -->

## ENV `SEED_GROUPS_TOTAL`

specifies how many groups should be created or deleted

* default value: `1`
* `export SEED_GROUPS_TOTAL=2`

<!--- -->

## ENV `DATA_CALENDAR_ROOT`

specifies the root of the calendar tree structure. Will be placed inside `SEED_CONTAINER_TYPE`

* default value: `calendar`
* `export DATA_CALENDAR_ROOT=dummy_calendar`


<!--- -->

## ENV `DATA_CALENDAR_FROM_YEAR`

specifies in which year the calendar should start

* default value: `2023`
* `export DATA_CALENDAR_FROM_YEAR=2000`


<!--- -->

## ENV `DATA_CALENDAR_TO_YEAR`

specifies in which year the calendar should end

* default value: `2023`
* `export DATA_CALENDAR_FROM_YEAR=2002`


<!--- -->

## ENV `SEED_RESOURCE_ROOT`

specifies the name of the folder in which the test resources are located

* default value: `resource`
* `export SEED_RESOURCE_ROOT=dummy_resources`

<!--- -->

## ENV `SEED_RESOURCE_SMALL_NAME`

specifies how small resource should be called

* default value: `small.zip`
* `export SEED_RESOURCE_SMALL_NAME=s.zip`


<!--- -->

## ENV `SEED_RESOURCE_SMALL_SIZE`

this allows you to set the file size of the small resource in mb

* default value: `1`
* `export SEED_RESOURCE_SMALL_SIZE=2`


<!--- -->

## ENV `SEED_RESOURCE_MEDIUM_NAME`

specifies how small resource should be called

* default value: `medium.zip`
* `export SEED_RESOURCE_MEDIUM_NAME=m.zip`


<!--- -->

## ENV `SEED_RESOURCE_MEDIUM_SIZE`

this allows you to set the file size of the medium resource in mb

* default value: `20`
* `export SEED_RESOURCE_MEDIUM_SIZE=40`


<!--- -->

## ENV `SEED_RESOURCE_LARGE_NAME`

specifies how small resource should be called

* default value: `large.zip`
* `export SEED_RESOURCE_LARGE_NAME=l.zip`


<!--- -->

## ENV `SEED_RESOURCE_LARGE_SIZE`

this allows you to set the file size of the small resource in mb

* default value: `100`
* `export SEED_RESOURCE_LARGE_SIZE=200`


<!--- -->

## ENV `POOL_USERS`

defines the path to the json files that contain the user information

* default value: `Embedded`
* `export POOL_USERS=$HOME/test/pools/users.json`


<!--- -->

## ENV `POOL_GROUPS`

defines the path to the json files that contain the group information

* default value: `Embedded`
* `export POOL_GROUPS=$HOME/test/pools/groups.json`


<!--- -->

## ENV `PLATFORM_BASE_URL`

the url under which the respective platform can be reached.

* default value: `https://localhost:9200`
* `export PLATFORM_BASE_URL=https://cloud-domain.org`


## ENV `AUTH_N_PROVIDER_TYPE`

defines which idp should be used

* default value: `kopano`
* `export AUTH_N_PROVIDER=keycloak`
* `export AUTH_N_PROVIDER=kopano`
* `export AUTH_N_PROVIDER=basicAuth`


<!--- -->

## ENV `AUTH_N_PROVIDER_KOPANO_BASE_URL`

indicates under which url kopano can be reached, only necessary if `AUTH_N_PROVIDER_TYPE` is set to `kopano`

* default value: `https://localhost:9200`
* `export AUTH_N_PROVIDER_KOPANO_BASE_URL=https://kopano.cloud-domain.org/auth/`


<!--- -->

## ENV `AUTH_N_PROVIDER_KOPANO_REDIRECT_URL`

specifies the redirect url, only necessary if `AUTH_N_PROVIDER_TYPE` is set to `kopano`

* default value: `https://localhost:9200/oidc-callback.html`
* `export AUTH_N_PROVIDER_KOPANO_BASE_URL=https://cloud-domain.org/oidc-callback.html`

<!--- -->

## ENV `AUTH_N_PROVIDER_KOPANO_CLIENT_ID`

specifies client id to use, only necessary if `AUTH_N_PROVIDER_TYPE` is set to `kopano`

* default value: `web`
* `export AUTH_N_PROVIDER_KOPANO_CLIENT_ID=other-client-id`


<!--- -->

## ENV `AUTH_N_PROVIDER_KEYCLOAK_REALM`

defines the keycloak realm, only necessary if `AUTH_N_PROVIDER_TYPE` is set to `keycloak`

* `export AUTH_N_PROVIDER_KEYCLOAK_REALM=ocis`


<!--- -->

## ENV `AUTH_N_PROVIDER_KEYCLOAK_BASE_URL`

indicates under which url keycloak can be reached, only necessary if `AUTH_N_PROVIDER_TYPE` is set to `keycloak`

* `export AUTH_N_PROVIDER_KEYCLOAK_BASE_URL=https://keycloak.cloud-domain.org/auth/`


<!--- -->

## ENV `AUTH_N_PROVIDER_KEYCLOAK_REDIRECT_URL`

specifies the redirect url, only necessary if `AUTH_N_PROVIDER_TYPE` is set to `keycloak`

* `export AUTH_N_PROVIDER_KEYCLOAK_REDIRECT_URL=https://cloud-domain.org/oidc-callback.html`


<!--- -->

## ENV `AUTH_N_PROVIDER_KEYCLOAK_SOCIAL_PROVIDER_REALM`

specifies the social auth realm, only necessary if `AUTH_N_PROVIDER_TYPE` is set to `keycloak`

* `export AUTH_N_PROVIDER_KEYCLOAK_SOCIAL_PROVIDER_REALM=social-realm`


<!--- -->

## ENV `AUTH_N_PROVIDER_KEYCLOAK_CLIENT_ID`

specifies client id to use, only necessary if `AUTH_N_PROVIDER_TYPE` is set to `keycloak`

* default value: `web`
* `export AUTH_N_PROVIDER_KEYCLOAK_CLIENT_ID=other-client-id`
