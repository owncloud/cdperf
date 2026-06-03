# cdperf

<!-- OSPO-managed README | Generated: 2026-04-16 | v2 -->

[![License](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE) [![ownCloud OSPO](https://img.shields.io/badge/OSPO-ownCloud-blue)](https://kiteworks.com/opensource) [![Docker Hub](https://img.shields.io/docker/pulls/owncloud)](https://hub.docker.com/r/owncloud/ocis)

cdperf (cloud performance) is a testing toolbox for measuring and benchmarking the performance of different cloud storage systems. It uses [k6](https://k6.io/) as the load testing engine and provides a test development kit (k6-tdk) along with ready-to-use test suites. The toolbox supports testing against ownCloud Infinite Scale (oCIS), ownCloud Server (Classic/OC10), and Nextcloud.

## Part of oCIS

cdperf is part of the [ownCloud Infinite Scale (oCIS)](https://github.com/owncloud/ocis) ecosystem and is used for continuous performance testing. See the [oCIS documentation](https://owncloud.dev) for more information.

This component is part of the [oCIS Docker image](https://hub.docker.com/r/owncloud/ocis).

## Getting Started

Follow the steps below to build and run performance tests.

### Prerequisites

- [pnpm](https://pnpm.io/) package manager

### Building

```bash
pnpm install
pnpm build
```

### Running Tests

```bash
pnpm test
```

### Package Index

- [k6-tdk](packages/k6-tdk) - Test development kit for writing k6 performance tests
- [k6-tests](packages/k6-tests) - Ready-to-use k6 test suites
- [eslint-config](packages/eslint-config) - Shared ESLint configuration
- [tsconfig](packages/tsconfig) - Shared TypeScript configuration
- [turbowatch](packages/turbowatch) - Shared Turbowatch configuration

## Documentation

- [cdperf documentation](https://owncloud.dev/cdperf/)
- [k6 documentation](https://k6.io/docs/)

## Community & Support

**[Star](https://github.com/owncloud/cdperf)** this repo and **Watch** for release notifications!

- [ownCloud Website](https://owncloud.com)
- [Community Discussions](https://github.com/orgs/owncloud/discussions)
- [Matrix Chat](https://app.element.io/#/room/#owncloud:matrix.org)
- [Documentation](https://doc.owncloud.com)
- [Enterprise Support](https://owncloud.com/contact-us/)
- [OSPO Home](https://kiteworks.com/opensource)

## Contributing

We welcome contributions! Please read the [Contributing Guidelines](CONTRIBUTING.md)
and our [Code of Conduct](CODE_OF_CONDUCT.md) before getting started.

### Workflow

- **Rebase Early, Rebase Often!** We use a rebase workflow. Always rebase on the target branch before submitting a PR.
- **Dependabot**: Automated dependency updates are managed via Dependabot. Review and merge dependency PRs promptly.
- **Signed Commits**: All commits **must** be PGP/GPG signed. See [GitHub's signing guide](https://docs.github.com/en/authentication/managing-commit-signature-verification).
- **DCO Sign-off**: Every commit must carry a `Signed-off-by` line:
  ```
  git commit -s -S -m "your commit message"
  ```
- **GitHub Actions Policy**: Workflows may only use actions that are (a) owned by `owncloud`, (b) created by GitHub (`actions/*`), or (c) verified in the GitHub Marketplace.

## Security

**Do not open a public GitHub issue for security vulnerabilities.**

Report vulnerabilities at **<https://security.owncloud.com>** -- see [SECURITY.md](SECURITY.md).

Bug bounty: [YesWeHack ownCloud Program](https://yeswehack.com/programs/owncloud-bug-bounty-program)

## License

This project is licensed under the [Apache-2.0](LICENSE).

## About the ownCloud OSPO

The [Kiteworks Open Source Program Office](https://kiteworks.com/opensource), operating under
the [ownCloud](https://owncloud.com) brand, launched on May 5, 2026, to steward the open source
ecosystem around ownCloud's products. The OSPO ensures transparent governance, license compliance,
community health, and sustainable collaboration between the open source community and
[Kiteworks](https://www.kiteworks.com), which acquired ownCloud in 2023.

- **OSPO Home**: <https://kiteworks.com/opensource>
- **GitHub**: <https://github.com/owncloud>
- **ownCloud**: <https://owncloud.com>

For questions about the OSPO or licensing, contact ospo@kiteworks.com.

> **License status:** This repository is already licensed under Apache-2.0 -- the OSPO target license.
> No migration is required.
