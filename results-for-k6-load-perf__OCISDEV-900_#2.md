# k6 Load / Performance Results — OCISDEV-900

**Date:** 2026-09-16
**Result:** ✅ **PASS** — and this time the threshold gate was genuinely armed and genuinely passed.

> ## ⚠️ Read this first: the threshold gate was never active in earlier runs
>
> The artifact named in the instructions — `packages/k6-tests/artifacts/koko-platform-000-mixed-ramping-k6.js`
> — is a **stale build that contains no `thresholds` key at all**. Its `options` object has only
> `insecureSkipTLSVerify` and `scenarios`. Therefore `ENABLE_THRESHOLDS=true` and
> `THRESHOLD_HTTP_REQ_FAILED="rate<0.02"` had **no effect**, k6 printed no `THRESHOLDS` block, and
> `exit 0` meant only *"the run finished"* — **not** *"the gates held"*.
>
> A second, current build of the same source exists as
> `packages/k6-tests/artifacts/tests-koko-platform-000-mixed-ramping-k6.js`, and it **does** carry the
> threshold block. I ran both so this report contains a real gated verdict.
>
> **This retroactively affects `results-for-k6-load-perf__master.md` and
> `results-for-ALL-k6-load-perf__master.md`.** Both state or imply that thresholds were enforced.
> Their measured numbers are valid; their *pass/fail-by-threshold* reasoning is not. See
> [Artifact staleness](#artifact-staleness--the-central-finding).

## Environment

| Item | Value |
| --- | --- |
| cdperf commit | `b7a3ac5` (branch `next_local-runs_OCISDEV-900`) |
| k6 | v1.0.0 (go1.24.2, darwin/arm64) |
| Target | Infinite Scale **8.2.0+`dd15f601ec1`** (compiled 2026-09-16) |
| oCIS binary | `~/Projects/ownCloud/ocis_1/ocis/bin/ocis` (pid 9366 — the user's own instance) |
| Host | Mac15,6 · 11 cores · macOS 26.6.2 |
| Execution | local — k6 and oCIS on the same machine |

Build identity was confirmed on both sides: `status.php` → `"productversion":"8.2.0+dd15f601ec1"`
and `ocis version` → `8.2.0+dd15f601ec1`. **Same binary as the previous OCISDEV-900 run**, so the
runs below are true repeat samples, not a build comparison.

## Configuration

8 scenarios × 2 VUs, ramp 10s up / 30s peak / 10s down, 1s sleep after each iteration.
Peak = **16 VUs**. Seeded 20 users (≥ 16 peak VUs).

Requested thresholds: `ENABLE_THRESHOLDS=true`, `THRESHOLD_HTTP_REQ_FAILED=rate<0.02`, plus the
repo default `THRESHOLD_HTTP_REQ_DURATION=p(95)<500` (`values/env.ts:164-170`, not overridden).

## Seed

`_seeds-up-k6.js` with `SEED_USERS_TOTAL=20` — **836 / 836 checks passed**, `http_req_failed`
0.00% (0 / 816), 816 requests, 122 MB sent, **1m25s** (17:02:23 → 17:03:48).

No pre-teardown needed: the server was already clean from the previous session's cleanup.

## Threshold verdict

From the **gated** artifact (`tests-koko-platform-000-mixed-ramping-k6.js`), k6's own block:

```
█ THRESHOLDS

  http_req_duration
  ✓ 'p(95)<500' p(95)=371.62ms

  http_req_failed
  ✓ 'rate<0.02' rate=0.00%
```

| Metric | Threshold | Actual | Verdict |
| --- | --- | --- | --- |
| `http_req_failed` | `rate<0.02` | 0.00% (0 / 707) | ✅ **pass** (enforced) |
| `http_req_duration` | `p(95)<500` | **371.62 ms** | ✅ **pass**, 128 ms headroom (enforced) |

k6 exited **0** with the gate armed — so this is a real CI-equivalent pass. Note the healthy
128 ms of margin, versus the alarming 31 ms reported last time.

## Totals — both runs

Run B is the artifact named in the instructions (ungated). Run C is the current artifact (gated).

| Metric | **Run B** — instructed artifact | **Run C** — gated artifact |
| --- | --- | --- |
| Thresholds armed? | ❌ no (stale build) | ✅ yes |
| k6 exit | 0 (meaningless as a gate) | **0 (gate passed)** |
| Checks | **689 / 689 (100.00%)** | **731 / 731 (100.00%)** |
| SKIPPED checks | 4 | **0** |
| `http_reqs` | 651 (12.12 /s) | 707 (13.41 /s) |
| `http_req_failed` | 0.00% (0 / 651) | 0.00% (0 / 707) |
| `http_req_duration` | avg 101.23 ms · min 3.55 ms · med 30.84 ms · p(90) 286.04 ms · **p(95) 427.06 ms** · max 1.04 s | avg 90.95 ms · min 3.28 ms · med 36.57 ms · p(90) 261.36 ms · **p(95) 371.62 ms** · max 746.14 ms |
| `http_req_waiting` (TTFB) | avg 89.94 ms · med 28.81 ms · p(95) 359.68 ms · max 1.04 s | avg 81.02 ms · med 33.36 ms · p(95) 347.55 ms · max 665.59 ms |
| `http_req_receiving` | avg 9.27 ms · p(95) 8.69 ms · max 596.92 ms | avg 8.23 ms · p(95) 8.46 ms · max 564.67 ms |
| `http_req_sending` | avg 2.01 ms · p(95) 60.49 µs · max 385.76 ms | avg 1.68 ms · p(95) 74.39 µs · max 354.59 ms |
| `http_req_blocked` | avg 76.04 µs · p(95) 15.49 µs · max 4.28 ms | avg 157.97 µs · p(95) 17 µs · max 19.24 ms |
| `http_req_tls_handshaking` | avg 56.03 µs · max 3.57 ms | avg 94.73 µs · max 6.48 ms |
| `iterations` | 369 (6.87 /s) | 377 (7.15 /s) |
| `iteration_duration` | avg 1.80 s · med 1.02 s · p(95) 4.91 s · max 8.56 s | avg 1.75 s · med 1.03 s · p(95) 4.82 s · max 7.73 s |
| `vus` / `vus_max` | 16 / 16 | 16 / 16 |
| Data received / sent | 1.2 GB (22 MB/s) / 331 MB (6.2 MB/s) | 1.2 GB (22 MB/s) / 332 MB (6.3 MB/s) |
| Wall clock | 55 s (17:03:58 → 17:04:53) | 54 s (17:06:29 → 17:07:23) |

Post-run health probe: oCIS alive, `status=200` in 38 ms (after B) and 4 ms (after C).

The current artifact did **more** work — 707 requests vs 651, 731 checks vs 689 — and was still
faster at p(95). That matters for the regression question below.

## Per-scenario breakdown

### Run C — gated artifact (the authoritative run)

Sorted by p(95), slowest first.

| Scenario | Checks | Reqs | Fail % | avg | med | p(90) | p(95) | max | Iters | Iter avg |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `download_050` | 77/77 | 77 | 0.00 | 138.45 ms | 39.86 ms | 473.97 ms | **493.01 ms** | 596.17 ms | 69 | 1.18 s |
| `create_remove_group_share_090` | 92/92 | 92 | 0.00 | 125.80 ms | 55.37 ms | 333.35 ms | 433.15 ms | 616.97 ms | 14 | 5.98 s |
| `create_upload_rename_delete_folder_and_file_040` | 80/80 | 80 | 0.00 | 142.06 ms | 62.30 ms | 361.98 ms | 421.95 ms | 746.14 ms | 18 | 4.76 s |
| `create_space_080` | 81/81 | 81 | 0.00 | 96.89 ms | 43.75 ms | 260.14 ms | 366.14 ms | 507.48 ms | 25 | 3.32 s |
| `user_group_search_070` | 82/82 | 82 | 0.00 | 68.57 ms | 24.59 ms | 172.45 ms | 278.79 ms | 488.30 ms | 76 | 1.07 s |
| `add_remove_tag_100` | 128/128 | 104 | 0.00 | 87.68 ms | 66.27 ms | 198.05 ms | 276.93 ms | 611.69 ms | 24 | 3.47 s |
| `navigate_file_tree_020` | 84/84 | 84 | 0.00 | 42.76 ms | 12.26 ms | 124.20 ms | 249.76 ms | 326.53 ms | 76 | 1.07 s |
| `sync_client_110` | 107/107 | 107 | 0.00 | 42.26 ms | 10.73 ms | 126.50 ms | 249.21 ms | 395.45 ms | 75 | 1.09 s |

**No scenario exceeds 500 ms at p(95).** `download_050` is closest at 493 ms.

### Run B — instructed artifact

| Scenario | Checks | Reqs | Fail % | avg | med | p(90) | p(95) | max | Iters | Iter avg |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `create_remove_group_share_090` | 78/78 | 78 | 0.00 | 176.69 ms | 55.86 ms | 434.29 ms | **596.80 ms** | 1.04 s | 14 | 6.14 s |
| `download_050` | 75/75 | 75 | 0.00 | 152.55 ms | 33.09 ms | 492.79 ms | **522.28 ms** | 628.53 ms | 67 | 1.20 s |
| `create_upload_rename_delete_folder_and_file_040` | 80/80 | 80 | 0.00 | 150.10 ms | 62.61 ms | 309.15 ms | **505.81 ms** | 849.15 ms | 18 | 4.79 s |
| `create_space_080` | 81/81 | 81 | 0.00 | 115.06 ms | 47.08 ms | 330.53 ms | 408.43 ms | 541.77 ms | 25 | 3.38 s |
| `add_remove_tag_100` | 103/103 | 65 | 0.00 | 106.43 ms | 84.57 ms | 242.14 ms | 306.89 ms | 463.99 ms | 19 | 4.48 s |
| `user_group_search_070` | 84/84 | 84 | 0.00 | 44.19 ms | 8.59 ms | 155.54 ms | 265.13 ms | 420.93 ms | 78 | 1.04 s |
| `navigate_file_tree_020` | 82/82 | 82 | 0.00 | 52.42 ms | 9.60 ms | 187.45 ms | 260.08 ms | 509.10 ms | 74 | 1.08 s |
| `sync_client_110` | 106/106 | 106 | 0.00 | 41.68 ms | 7.64 ms | 163.55 ms | 259.56 ms | 514.45 ms | 74 | 1.09 s |

## Artifact staleness — the central finding

Two builds of `tests/koko/platform/000-mixed/ramping.k6.ts` coexist in `artifacts/`
(the directory is gitignored — `.gitignore:10` — so it is pure build output, never committed):

| Artifact | Built | `thresholds` | SKIPPED checks |
| --- | --- | --- | --- |
| `koko-platform-000-mixed-ramping-k6.js` | Sep 11 18:10 | ❌ **absent** | 4 |
| `tests-koko-platform-000-mixed-ramping-k6.js` | Sep 16 12:55 | ✅ present | 0 |

The current source has the block, so only the newer artifact reflects it:

```ts
...(settings.thresholds.enabled && {
  thresholds: {
    http_req_failed: [settings.thresholds.rate],
    http_req_duration: [settings.thresholds.duration]
  }
})
```

The stale artifact's `options` ends after `scenarios` — no `thresholds`, no `settings` binding at all.

The two builds also differ in **which client API the scenarios exercise**, so they are not
interchangeable:

| Stale artifact | Current artifact |
| --- | --- |
| `search.searchForSharees` | `user.findUser`, `group.findGroup` |
| `share.createShare` / `deleteShare` | `share.createShareInvitation` / `deleteShareInvitation` |
| `tag.getTags` **(SKIPPED)**, `tag.createTag` **(SKIPPED)** | `tag.getTagForResource`, `test -> resource.getTags - name - match` |

**This resolves an open item from the earlier reports.** I had flagged `tag.getTags` /
`tag.createTag` as "SKIPPED in every run — worth a separate look." They are skipped only in the
stale build; the current build exercises tag reads properly and skips nothing. There is no test-coverage
gap to chase.

The same duplication exists for the seeds (`_seeds-up/down-k6.js` vs `src-seeds-up/down-k6.js`,
different checksums). I seeded and tore down with the `_seeds-*` pair as instructed, keeping the
pool naming consistent across both halves.

**Recommendation:** run `pnpm build` (→ `turbo run build` → `node build.mjs`) and delete the
`artifacts/` directory first, so only one build of each test exists. Then update the documented
command to whatever filename the build emits. As it stands, the command in the CI/runbook silently
disables the very gate it sets up.

## Latency: the suspected regression is not supported

The previous OCISDEV-900 report flagged a possible regression on `dd15f601ec1`. With a second
same-build, same-artifact sample, that no longer holds up. All four samples below use the **stale**
artifact, so they are like-for-like:

| p(95) | `13583aba0f2` | `dd15f601ec1` |
| --- | --- | --- |
| sample 1 | 417.31 ms | 468.31 ms |
| sample 2 | 375.23 ms | 427.06 ms |
| **mean** | **396.27 ms** | **447.69 ms** |
| within-build spread | 42.08 ms | 41.25 ms |

The between-build gap in means is **51.4 ms** while the within-build spread is **~42 ms** — the
same order of magnitude. The two ranges fail to overlap, but only by 9.75 ms. At n=2 per build that
is not a distinguishable difference; it is what run-to-run noise on a shared 11-core laptop looks like.

Two further points argue against a server-side regression:

- The gated run on the **same** build hit **371.62 ms** — below every one of the four samples above,
  including both old-build samples — while issuing 8.6% more requests. If `dd15f601ec1` were
  meaningfully slower, that is hard to produce.
- `download_050` p(95) across the same build: 546.38 → 522.28 → 493.01 ms. Monotonically down across
  three runs, with no code change. Pure variance.

**Conclusion: withdraw the regression flag.** The earlier report's "median +33%, avg +17%" was a
one-sample artifact. Cross-artifact medians (30.84 / 36.57 ms) should not be compared at all, since
the request mix differs.

The one durable observation: the aggregate p(95) sits in the 370–470 ms band against a 500 ms gate.
That is thin margin regardless of build, and `download_050` alone runs at ~500 ms. Expect
intermittent gate failures once the gate is actually wired up — which, per the finding above, it has
not been.

## Cleanup

Run as requested, after the tests.

| Step | Outcome |
| --- | --- |
| `_seeds-down-k6.js`, `SEED_USERS_TOTAL=20` | ✅ **28 / 28 checks**, 0.00% `http_req_failed` (0/28), exit 0, 6 s (17:08:17 → 17:08:23) |
| Orphaned personal drives | ⚠️ **2 left behind**, removed manually |

The teardown deleted all 20 users and the group, but left the personal spaces of
**`perf-test-user-11`** and **`perf-test-user-9`** behind as orphaned `personal` drives — users
gone, drives still listed. I purged them (disable + `Purge: T`). Both calls returned **HTTP 500**
yet the drives disappeared from `/graph/v1.0/drives` and their on-disk directories are gone — the
same half-deleted signature seen after the 300-VU crash: user deletion had already removed the node
metadata, so the space delete errored on missing `.mpk`/`.mlock` files while still dropping the
index entry.

Worth noting this happened on a **clean, non-crashing run**, so it is not crash fallout — it looks
like a genuine ordering bug in seed teardown (delete user before purging their space). Two of twenty
users, so it is intermittent.

**Verified final state:**

- Users: **6** — `admin`, `einstein`, `katherine`, `marie`, `moss`, `richard`. 0 matching `perf[-_]?test[-_]?user|perftestuser|iteration|k6`.
- Groups: **8**, all oCIS demo groups (`users`, `sailing-lovers`, …). 0 perf groups.
- Drives: **2** — `Admin` (personal) + `Shares` (virtual). **0 orphans.**
- Disk: `~/.ocis/storage/users/spaces` = one 4 KB dir, `dcae2f1d-…`, matching the Admin drive ID.
  `users/uploads` = **0 B**. The 3.6 MB under `storage/metadata` is oCIS's own system metadata, not test data.

The user's oCIS instance (**pid 9366**) was **left running** — responding `200` in 4 ms.

## Reproducing

```sh
export ADMIN_LOGIN=admin ADMIN_PASSWORD=admin
export PLATFORM_BASE_URL=https://localhost:9200
export AUTH_N_PROVIDER_KOPANO_BASE_URL=https://localhost:9200
export AUTH_N_PROVIDER_KOPANO_REDIRECT_URL=https://localhost:9200/oidc-callback.html

export SEED_USERS_TOTAL=20
k6 run -q packages/k6-tests/artifacts/_seeds-up-k6.js

for id in 020 040 050 070 080 090 100 110; do
  export TEST_KOKO_PLATFORM_${id}_RAMPING_STAGES_VUS=2
  export TEST_KOKO_PLATFORM_${id}_RAMPING_STAGES_UP_DURATION=10s
  export TEST_KOKO_PLATFORM_${id}_RAMPING_STAGES_PEAK_DURATION=30s
  export TEST_KOKO_PLATFORM_${id}_RAMPING_STAGES_DOWN_DURATION=10s
  export TEST_KOKO_PLATFORM_${id}_RAMPING_SLEEP_AFTER_ITERATION=1s
done

export ENABLE_THRESHOLDS=true
export THRESHOLD_HTTP_REQ_FAILED="rate<0.02"

# as instructed — NOTE: this artifact ignores the thresholds above
k6 run -q packages/k6-tests/artifacts/koko-platform-000-mixed-ramping-k6.js

# threshold-armed equivalent — use this one for a real gate
k6 run -q packages/k6-tests/artifacts/tests-koko-platform-000-mixed-ramping-k6.js

k6 run -q packages/k6-tests/artifacts/_seeds-down-k6.js
```

Deviations from the instructions as given, and why:

- **Added the second run against `tests-koko-platform-000-mixed-ramping-k6.js`.** The instructed
  artifact silently ignores `ENABLE_THRESHOLDS`, so without this there would be no pass/fail verdict
  to report — only an exit code that means nothing.
- Added `--summary-mode=full --summary-export=...` alongside `-q`. `-q` only disables progress
  updates so it does not conflict, but on its own it also suppresses the per-scenario breakdown *and*
  the `THRESHOLDS` block — capturing both in the same pass avoided extra runs.
- Captured the exit code from an unpiped command rather than `${pipestatus[1]}`; equivalent, and
  avoids the zsh-vs-bash pipe-status difference.
- Purged 2 orphaned personal drives after the teardown, which the teardown script does not handle.

### Artifacts

`/tmp/k6_seed_900b.log` · `/tmp/k6_900b.log` + `/tmp/k6_900b_summary.json` (run B) ·
`/tmp/k6_900c.log` + `/tmp/k6_900c_summary.json` (run C, gated) · `/tmp/k6_down_900b.log`

Prior reports: `results-for-k6-load-perf__master.md` ·
`results-for-ALL-k6-load-perf__master.md` · `results-for-ALL-k6-load-perf__master.run1-crashed.md`
— the first two contain threshold claims superseded by the finding above.
