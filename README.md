# ownCloud cloud testing toolbox

This repository contains the tools we use to test and measure the performance of different cloud systems.

For detailed information how to run and write new tests, please read [the cdperf documentation](https://owncloud.dev/cdperf/).

## Supported clouds
* [Infinite Scale](https://github.com/owncloud/ocis)

## Package Index

* [k6-tdk](packages/k6-tdk): Test development kit, look here how to write tests.
* [k6-tests](packages/k6-tests): Ready to use k6 tests, If you want to start testing right away, look here.
* [eslint-config](packages/eslint-config): ESLint config shared across the packages, not public facing.
* [tsconfig](packages/tsconfig): TypeScript config shared across the packages, not public facing.
* [turbowatch](packages/turbowatch): Turbowatch config shared across the packages, not public facing.

## Security

If you find a security issue please contact [security@owncloud.com](mailto:security@owncloud.com) first

## Contributing

Fork -> Patch -> Push -> Pull Request

### Building

- You need pnpm
- Run `pnpm install`
- Run `pnpm build`

## License

Apache-2.0

## Dictonary

* **oCis**: [ownCloud Infinite Scale](https://github.com/owncloud/ocis)
* **k6-tdk**: k6 test development kit
* **cdPerf**: cloud performance

## Copyright
```console
Copyright (c) 2023 ownCloud GmbH <https://owncloud.com>
```
