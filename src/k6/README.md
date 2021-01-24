## Requirements
*  [K6](https://k6.io/)
*  [YARN](https://yarnpkg.com/)
*  [OCIS](https://github.com/owncloud/ocis)

## How to build
```console
$ yarn
$ yarn build
```

## How to run
```console
k6 run ./dist/NAME_OF_TEST.js
```

## How add new tests
The best point to start is to have a look at the existing tests which can be found [here](src/test).

The tests ares structured by platform -> repo -> issue id -> name. For example /src/test/issue/github/ocis/42/test-name.ts gets test-issue-github-ocis-51-test-name.js

## Environment variables
```console
$ CLOUD_LOGIN=USERNAME CLOUD_PASSWORD=PASSWORD k6 run ...
$ CLOUD_VENDOR=URL k6 run ...
$ CLOUD_ID=URL k6 run ...
$ CLOUD_HOST=URL k6 run ...
$ CLOUD_OIDC_ISSUER=URL k6 run ...
$ CLOUD_OIDC_ENABLED=BOOL k6 run ...
```