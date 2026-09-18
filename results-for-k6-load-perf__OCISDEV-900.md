# k6 Load / Performance Results — OCISDEV-900

**Date:** 2026-09-16
**Result:** ✅ **PASS** — k6 exited 0, 686/686 checks succeeded, 0% request failures, server stayed up.

## Environment

| Item | Value |
| --- | --- |
| cdperf commit | `c493ddc` (branch `next`) |
| k6 | v1.0.0 (go1.24.2, darwin/arm64) |
| Target | Infinite Scale **8.2.0+`dd15f601ec1`** (compiled 2026-09-16) |
| oCIS binary | `~/Projects/ownCloud/ocis_1/ocis/bin/ocis` (pid 9366, cwd `ocis_1`) |
| Host | Mac15,6 · 11 cores · macOS 26.6.2 |
| Execution | local — k6 and oCIS on the same machine |

> **This is a different build from the earlier 300-VU crash investigation**, which ran
> `8.2.0+13583aba0f2`. Comparisons below are therefore across two binaries, not just two runs.

## Configuration

Load profile: 8 scenarios × 2 VUs, ramp 10s up / 30s peak / 10s down, 1s sleep after each
iteration. Peak = **16 VUs**. Seeded 20 users (≥ 16 peak VUs).

Thresholds: `ENABLE_THRESHOLDS=true`, `THRESHOLD_HTTP_REQ_FAILED=rate<0.02`, plus the repo
default `THRESHOLD_HTTP_REQ_DURATION=p(95)<500` (not overridden).

## Thresholds

| Metric | Threshold | Actual | Verdict |
| --- | --- | --- | --- |
| `http_req_failed` | `rate<0.02` | 0.00% (0 / 648) | ✅ pass |
| `http_req_duration` | `p(95)<500` | **468.31 ms** | ⚠️ pass, **31 ms of headroom** |

k6 exited **0** (it exits 99 on breach), so both gates held. But the duration gate passed by
6%, which is worth attention — see the regression note below.

## Seed

`_seeds-up-k6.js` with `SEED_USERS_TOTAL=20` — **836 / 836 checks passed**, `http_req_failed`
0.00% (0 / 816), 816 requests, 122 MB sent, 1m31s.

No pre-teardown was needed: the server was already clean (0 `perf-test-user-*`, 0
`perf-test-group-*`) from the previous session's cleanup.

## Totals

| Metric | Value |
| --- | --- |
| Checks | **686 / 686 succeeded (100.00%)**, 0 failed |
| `http_reqs` | 648 (11.94 /s) |
| `http_req_failed` | 0.00% (0 / 648) |
| `http_req_duration` | avg 104.53 ms · min 3.77 ms · med 35.95 ms · **p(90) 307.63 ms · p(95) 468.31 ms** · max 945.62 ms |
| `http_req_waiting` (TTFB) | avg 92.33 ms · med 32.24 ms · p(95) 370.47 ms · max 730.56 ms |
| `http_req_blocked` | avg 183.52 µs · p(95) 22.29 µs · max 16.41 ms |
| `http_req_tls_handshaking` | avg 139.63 µs · max 12.91 ms |
| `iterations` | 366 (6.74 /s) |
| `iteration_duration` | avg 1.81 s · med 1.02 s · p(95) 5.07 s · max 8.06 s |
| `vus` / `vus_max` | max 16 / 16 |
| Data received / sent | 1.2 GB (21 MB/s) / 331 MB (6.1 MB/s) |
| Wall clock | 56 s (16:36:48 → 16:37:44) |

Post-run probe: oCIS alive, `status=200` in 48 ms.

## Per-scenario breakdown

Sorted by p(95) request duration, slowest first.

| Scenario | Checks | Reqs | Fail % | avg | med | p(90) | p(95) | max | Iters | Iter avg |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `download_050` | 75/75 | 75 | 0.00 | 152.95 ms | 43.12 ms | 523.36 ms | **546.38 ms** | 624.17 ms | 67 | 1.20 s |
| `create_upload_rename_delete_folder_and_file_040` | 80/80 | 80 | 0.00 | 158.26 ms | 84.27 ms | 350.34 ms | **496.08 ms** | 945.62 ms | 18 | 4.84 s |
| `create_remove_group_share_090` | 78/78 | 78 | 0.00 | 155.80 ms | 71.64 ms | 409.36 ms | **479.30 ms** | 729.98 ms | 14 | 6.03 s |
| `create_space_080` | 81/81 | 81 | 0.00 | 113.20 ms | 44.30 ms | 332.61 ms | 417.68 ms | 597.88 ms | 25 | 3.37 s |
| `add_remove_tag_100` | 103/103 | 65 | 0.00 | 118.07 ms | 84.50 ms | 301.30 ms | 370.56 ms | 721.83 ms | 19 | 4.52 s |
| `navigate_file_tree_020` | 82/82 | 82 | 0.00 | 55.75 ms | 12.93 ms | 158.11 ms | 272.09 ms | 618.68 ms | 74 | 1.09 s |
| `user_group_search_070` | 82/82 | 82 | 0.00 | 55.89 ms | 11.73 ms | 168.00 ms | 269.39 ms | 718.05 ms | 76 | 1.06 s |
| `sync_client_110` | 105/105 | 105 | 0.00 | 51.96 ms | 12.24 ms | 170.35 ms | 264.38 ms | 730.74 ms | 73 | 1.10 s |

Three scenarios now sit at or above the 500 ms mark individually (`download_050` at 546 ms
exceeds it; `040` at 496 ms and `090` at 479 ms are within ~25 ms). The gate is evaluated on
the aggregate, so the run still passes.

## ⚠️ Possible latency regression vs `13583aba0f2`

Same 16-VU configuration, same host, same cdperf commit — only the oCIS build differs:

| Metric | `13583aba0f2` run A | `13583aba0f2` run B | **`dd15f601ec1`** |
| --- | --- | --- | --- |
| p(95) | 417.31 ms | 375.23 ms | **468.31 ms** |
| p(90) | 289.70 ms | 283.88 ms | **307.63 ms** |
| median | 27.48 ms | 27.02 ms | **35.95 ms** |
| avg | 89.82 ms | 89.34 ms | **104.53 ms** |
| max | 778 ms | 1.07 s | 945.62 ms |
| checks | 691/691 | 689/689 | 686/686 |
| failures | 0% | 0% | 0% |

The new build is slower on every central-tendency measure: median +33%, avg +17%, p(95) above
both prior samples. `download_050`'s p(95) also rose from 529.65 ms to 546.38 ms.

**Treat this as a signal, not a proven regression.** Caveats that matter:

- n=1 on the new build against n=2 on the old. The two old-build runs alone differed by 42 ms
  at p(95) (~11% spread), so run-to-run variance here is not small.
- k6 and oCIS share 11 cores on a laptop, so background load contaminates absolute numbers.
- 56-second runs at 16 VUs are short; percentiles rest on only ~650 requests.

To turn this into a real answer: run each build 5+ times alternating between them and compare
p(95) distributions rather than single values. If the ~90 ms p(95) gap holds up, the duration
gate will start failing intermittently, because 468 ms leaves only 31 ms of margin.

## Checks exercised

All passed. Auth: `logonResponse`, `authorizeResponse`, `accessTokenResponse`.
Client: `role.getMyDrives`, `search.searchForSharees`, `application.createDrive`,
`resource.createResource`, `resource.getResourceProperties`, `resource.downloadResource`,
`resource.uploadResource`, `resource.moveResource`, `resource.deleteResource`,
`drive.deactivateDrive`, `drive.deleteDrive`, `share.createShare`, `share.deleteShare`,
`tag.addTagToResource`, `tag.removeTagToResource`.

**Skipped:** `tag.getTags`, `tag.createTag` — reported SKIPPED by k6, not executed. These have
been skipped in every run so far; if tag coverage is meant to be exercised, that is worth a
separate look.

## Notes

- `030-search-for-filename` is commented out in `000-mixed/ramping.k6.ts`, so 8 of the 9
  exported scenarios ran. The `030` env vars were correctly omitted from the loop.
- **Seed data was left in place** — 20 `perf-test-user-*`, `perf-test-group-1` and the test
  root space are still on the server, since no cleanup step was requested. Run
  `k6 run -q packages/k6-tests/artifacts/_seeds-down-k6.js` with `SEED_USERS_TOTAL=20` to
  remove them. Do this before any re-seed: the seed script is **not idempotent** and every
  create will conflict otherwise.
- Unlike the 300-VU runs, the server showed no distress at 16 VUs and was healthy after the
  run. This configuration does not exercise the crash seen at ~236–300 VUs.

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
k6 run -q packages/k6-tests/artifacts/koko-platform-000-mixed-ramping-k6.js
```

One deviation from the instructions as given: added `--summary-mode=full --summary-export=...`
alongside `-q`. `-q` only disables progress updates so it does not conflict, but on its own it
also suppresses the per-scenario breakdown — capturing it in the same pass avoided a second run.

### Artifacts

`/tmp/k6_900.log` · `/tmp/k6_900_summary.json` · `/tmp/k6_seed_900.log`
Prior 300-VU crash report: `results-for-ALL-k6-load-perf__master.run1-crashed.md`
