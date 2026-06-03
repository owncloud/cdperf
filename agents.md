# AI Agent Guidelines for cdperf

This file provides context for AI coding agents (Claude Code, GitHub Copilot, Cursor, etc.) working in this repository.

## Repository Overview
- **Product family:** oCIS
- **Primary language(s):** TypeScript
- **Build system:** pnpm, Turbo (monorepo)
- **Test framework:** Turbo test runner
- **CI system:** GitHub Actions

## Architecture & Key Paths
- `packages/k6-tdk/` - k6 test development kit
- `packages/k6-tests/` - Ready-to-use k6 performance tests
- `packages/eslint-config/` - Shared ESLint configuration
- `packages/tsconfig/` - Shared TypeScript configuration
- `packages/turbowatch/` - Shared Turbowatch configuration
- `docs/` - Documentation (VitePress)
- `package.json` - Root package definition
- `pnpm-workspace.yaml` - pnpm workspace configuration
- `pnpm-lock.yaml` - Lockfile
- `turbo.json` - Turbo monorepo configuration

## Development Conventions
- **Branching:** main
- **Commit messages:** DCO sign-off required (`git commit -s`)
- **Code style:** ESLint, Prettier
- **PR process:** Open a PR against main. All CI checks must pass.

## Build & Test Commands
```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Test
pnpm test

# Lint
pnpm lint

# Fix lint issues
pnpm lint:fix

# Development mode
pnpm dev

# Documentation (dev server)
pnpm docs:dev
```

## Important Constraints
- All code contributions must be compatible with the **Apache-2.0** license
- Do not introduce new **copyleft-licensed dependencies** (GPL, AGPL, LGPL, MPL) without explicit discussion in an issue first. This is especially important for repos migrating to Apache 2.0.
- Do not introduce new dependencies without discussion in an issue first
- This is a pnpm workspace monorepo - respect package boundaries
- Performance tests target k6 - follow k6 patterns and APIs


## OSPO Policy Constraints

### GitHub Actions
- **Only** use actions owned by `owncloud`, created by GitHub (`actions/*`), verified on the GitHub Marketplace, or verified by the ownCloud Maintainers.
- Pin all actions to their full commit SHA (not tags): `uses: actions/checkout@<SHA> # vX.Y.Z`
- Never introduce actions from unverified third parties.

### Dependency Management
- Dependabot is configured for automated dependency updates.
- Review and merge Dependabot PRs as part of regular maintenance.
- Do not introduce new dependencies without discussion in an issue first.

### Git Workflow
- **Rebase policy**: Always rebase; never create merge commits. Use `git pull --rebase` and `git rebase` before pushing.
- **Signed commits**: All commits **must** be PGP/GPG signed (`git commit -S -s`).
- **DCO sign-off**: Every commit needs a `Signed-off-by` line (`git commit -s`).
- **Conventional Commits & Squash Merge**: Use the [Conventional Commits](https://www.conventionalcommits.org/) format where the repository enforces it. Many repos use squash merge, where the PR title becomes the commit message on the default branch — apply Conventional Commits format to PR titles as well. A reusable GitHub Actions workflow enforces this.

## Context for AI Agents
- Match existing code style
- Do not refactor unrelated code in the same PR
- Write tests for new functionality
- Keep PRs focused and atomic
- This is a monorepo - changes should be scoped to the relevant package
- Follow existing k6 test patterns when adding new performance tests
