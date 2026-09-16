# k6 Load / Performance Results — `master`

**Date:** 2026-09-16
**Result:** ✅ PASS — all thresholds met, 0 failed checks, 0 failed HTTP requests.

## Environment

| Item | Value |
| --- | --- |
| cdperf commit | `c493ddc` (branch `next`) |
| k6 | v1.0.0 (go1.24.2, darwin/arm64) |
| Target | Infinite Scale 8.2.0+13583aba0f2 (Community), `https://localhost:9200` |
| Host | Mac15,6 · 11 cores · macOS 26.6.2 |
| Execution | local, single k6 instance against a local oCIS server |

## Configuration

```sh
export ADMIN_LOGIN=admin ADMIN_PASSWORD=admin
export PLATFORM_BASE_URL=https://localhost:9200
export AUTH_N_PROVIDER_KOPANO_BASE_URL=https://localhost:9200
export AUTH_N_PROVIDER_KOPANO_REDIRECT_URL=https://localhost:9200/oidc-callback.html

export SEED_USERS_TOTAL=20        # >= total peak VUs (16)
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
k6 run -q packages/k6-tests/artifacts/koko-platform-000-mixed-ramping-k6.js
```

Load profile: 8 scenarios × 2 VUs, ramp 10s up / 30s peak / 10s down (50s per scenario,
1m20s max incl. graceful stop), 1s sleep after each iteration. Peak = **16 VUs**.

## Thresholds

| Metric | Threshold | Actual | Verdict |
| --- | --- | --- | --- |
| `http_req_failed` | `rate<0.02` (from env) | 0.00% (0 / 651) | ✅ pass |
| `http_req_duration` | `p(95)<500` (repo default, `THRESHOLD_HTTP_REQ_DURATION` not set) | p(95) = 375.23 ms | ✅ pass |

k6 exited **0**; it exits 99 on any threshold breach, so both thresholds held.

## Seed

`_seeds-up-k6.js` — **836 / 836 checks passed**, `http_req_failed` 0.00% (0 / 816),
816 requests, 122 MB sent, ~48s. Created 20 users (`perf-test-user-1..20`),
1 group (`perf-test-group-1`), the test-root space, small/medium/large resources and
the calendar tree.

> **Note:** the first seed attempt failed (789 / 835 checks failed) because seed state from a
> previous run was still present — `up.k6.ts` is not idempotent, so every `createUser`,
> `createGroup` and `createResource` hit a conflict. Running `_seeds-down-k6.js` first, then
> re-seeding, produced the clean 100% result above. Run the teardown before re-seeding.

## Mixed ramping test — totals

| Metric | Value |
| --- | --- |
| Checks | **689 / 689 succeeded (100.00%)**, 0 failed |
| `http_reqs` | 651 (12.17 /s) |
| `http_req_failed` | 0.00% (0 / 651) |
| `http_req_duration` | avg 89.34 ms · min 3.47 ms · med 27.02 ms · **p(90) 283.88 ms · p(95) 375.23 ms** · max 1.07 s |
| `http_req_waiting` (TTFB) | avg 77.93 ms · med 24.53 ms · p(95) 334.84 ms · max 1.07 s |
| `http_req_blocked` | avg 100.85 µs · p(95) 11 µs · max 5.09 ms |
| `http_req_tls_handshaking` | avg 59.33 µs · max 3.41 ms |
| `iterations` | 369 (6.90 /s) |
| `iteration_duration` | avg 1.78 s · med 1.02 s · p(95) 4.97 s · max 7.21 s |
| `vus` / `vus_max` | max 16 / 16 |
| Data received / sent | 1.2 GB (22 MB/s) / 331 MB (6.2 MB/s) |
| Wall clock | ~55 s |

## Per-scenario breakdown

Sorted by p(95) request duration, slowest first.

| Scenario | Checks | Reqs | Fail % | avg | med | p(90) | p(95) | max | Iters | Iter avg |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `download_050` | 76/76 | 76 | 0.00 | 142.63 ms | 31.96 ms | 499.19 ms | **529.65 ms** | 593.07 ms | 68 | 1.19 s |
| `create_remove_group_share_090` | 78/78 | 78 | 0.00 | 143.73 ms | 53.29 ms | 379.09 ms | **482.73 ms** | 1.07 s | 14 | 5.96 s |
| `add_remove_tag_100` | 103/103 | 65 | 0.00 | 103.90 ms | 53.67 ms | 334.46 ms | 382.61 ms | 913.40 ms | 19 | 4.47 s |
| `create_upload_rename_delete_folder_and_file_040` | 80/80 | 80 | 0.00 | 127.72 ms | 66.90 ms | 307.54 ms | 361.86 ms | 761.68 ms | 18 | 4.69 s |
| `create_space_080` | 81/81 | 81 | 0.00 | 86.28 ms | 28.07 ms | 226.26 ms | 311.28 ms | 558.16 ms | 25 | 3.28 s |
| `navigate_file_tree_020` | 82/82 | 82 | 0.00 | 47.18 ms | 8.74 ms | 144.26 ms | 300.39 ms | 324.98 ms | 74 | 1.08 s |
| `sync_client_110` | 106/106 | 106 | 0.00 | 42.21 ms | 7.71 ms | 135.71 ms | 294.04 ms | 340.65 ms | 74 | 1.09 s |
| `user_group_search_070` | 83/83 | 83 | 0.00 | 45.89 ms | 8.75 ms | 143.43 ms | 281.13 ms | 303.65 ms | 77 | 1.05 s |

## Checks exercised

All passed. Auth: `logonResponse`, `authorizeResponse`, `accessTokenResponse`.
Client: `role.getMyDrives`, `search.searchForSharees`, `application.createDrive`,
`resource.createResource`, `resource.getResourceProperties`, `resource.downloadResource`,
`resource.uploadResource`, `resource.moveResource`, `resource.deleteResource`,
`drive.deactivateDrive`, `drive.deleteDrive`, `share.createShare`, `share.deleteShare`,
`tag.addTagToResource`, `tag.removeTagToResource`.

**Skipped:** `tag.getTags`, `tag.createTag` (reported as SKIPPED by k6, not executed).

## Observations

- Clean run: no failed checks or requests in any scenario, so the `rate<0.02` failure
  budget was never touched.
- `download_050` has the highest p(95) at 529.65 ms — above the default `p(95)<500`
  bound, though the threshold is evaluated on the aggregate `http_req_duration`
  (375.23 ms), which passes. It is the throughput-bound scenario: 1.2 GB received in ~55 s.
- `create_remove_group_share_090` holds the worst single request (1.07 s max) and the
  longest iterations (avg 5.96 s), i.e. the heaviest write path in the mix.
- Read-mostly scenarios (`020`, `070`, `110`) sit around 8–9 ms median — an order of
  magnitude faster than the write/share paths.
- `030-search-for-filename` is commented out of `000-mixed/ramping.k6.ts`, so 8 of the
  9 exported scenarios ran; the `030` env vars were correctly omitted from the loop.

## Reproducing

Always tear down before re-seeding:

```sh
k6 run -q packages/k6-tests/artifacts/_seeds-down-k6.js
k6 run -q packages/k6-tests/artifacts/_seeds-up-k6.js
```

`-q` suppresses per-scenario detail; use `--summary-mode=full` for the breakdown above.
Seed teardown is scoped to the `perf-test-user-*` / `perf-test-group-*` pools and the test
root space — the oCIS demo users (einstein, marie, …) are not affected.
