# k6 Load / Performance Results — 3× repeated runs, OCISDEV-900

**Date:** 2026-09-16
**Result:** ✅ **3 / 3 PASS** — every run exited 0, 100% of checks succeeded, 0% request failures,
server stayed up throughout. Seed and cleanup clean in all three cycles.

## Average time — headline answer

| Phase | Run 1 | Run 2 | Run 3 | **Average** |
| --- | --- | --- | --- | --- |
| Seed (`_seeds-up-k6.js`) | 80 s | 89 s | 80 s | **83.00 s** |
| **Mixed ramping test** | 55 s | 54 s | 55 s | **54.67 s** |
| Cleanup (`_seeds-down-k6.js`) | 8 s | 9 s | 9 s | **8.67 s** |
| **Full cycle** | 143 s | 152 s | 144 s | **146.33 s** (2 m 26 s) |

Total wall clock for all three cycles: **469 s (7 m 49 s)**, 20:41:43 → 20:49:32. That is 439 s of
cycle time plus ~30 s spent purging orphaned drives between runs (see [Cleanup](#cleanup)).

The test itself is very stable in duration — 54–55 s, a 1 s spread. Seed time varies more
(80–89 s) because it uploads 122 MB each time.

## Environment

| Item | Value |
| --- | --- |
| cdperf commit | `b7a3ac5` (branch `next_local-runs_OCISDEV-900`) |
| k6 | v1.0.0 (go1.24.2, darwin/arm64) |
| Target | Infinite Scale **8.2.0+`dd15f601ec1`** — verified before each run |
| oCIS binary | `~/Projects/ownCloud/ocis_1/ocis/bin/ocis` (pid 9366, the user's own instance) |
| Host | Mac15,6 · 11 cores · 18 GB RAM · macOS 26.6.2 |
| Execution | local — k6 and oCIS on the same machine |
| Runs orchestrated by | **Claude Code v2.1.273** (CLI, `~/.local/bin/claude`) |
| Model | **Claude Opus 5** — model ID `us.anthropic.claude-opus-5` |

`dd15f601ec1` is the tip of the oCIS branch **`chore/OCISDEV-900-reva-bump`**, so these three runs
measure that branch.

> **On the tooling attribution:** Claude Code only orchestrated the runs — it invoked the `k6`
> binary, timed the phases, purged the orphaned drives and assembled this report. Every number in
> this document comes from k6's own `--summary-mode=full` output and the oCIS Graph API, not from the
> model. The raw logs listed under [Artifacts](#artifacts) let you verify any figure independently.

## Configuration

Identical in all three runs: 8 scenarios × 2 VUs, ramp 10s up / 30s peak / 10s down, 1s sleep after
each iteration. Peak = **16 VUs**. Seeded 20 users. Run via a single script so no parameter could
drift between cycles.

Each cycle was: **seed → mixed ramping test → cleanup → verify**, exactly as instructed.

## Results per run

| Metric | Run 1 | Run 2 | Run 3 | **Mean** | Spread |
| --- | --- | --- | --- | --- | --- |
| k6 exit code | 0 | 0 | 0 | — | — |
| Checks | 694/694 (100%) | 694/694 (100%) | 686/686 (100%) | — | — |
| `http_req_failed` | 0.00% (0/656) | 0.00% (0/656) | 0.00% (0/650) | **0.00%** | — |
| `http_reqs` | 656 | 656 | 650 | **654** | 6 |
| Requests/s | 12.42 | 12.33 | 12.03 | **12.26** | 0.39 |
| `http_req_duration` avg | 84.10 ms | 84.27 ms | 101.02 ms | **89.80 ms** | 16.92 ms |
| median | 28.01 ms | 28.59 ms | 35.60 ms | **30.73 ms** | 7.59 ms |
| p(90) | 254.91 ms | 253.38 ms | 283.73 ms | **264.01 ms** | 30.35 ms |
| **p(95)** | **345.71 ms** | **354.68 ms** | **425.44 ms** | **375.28 ms** | **79.73 ms** |
| max | 835.35 ms | 931.97 ms | 1.18 s | — | — |
| `http_req_waiting` avg | 74.16 ms | 74.48 ms | 90.45 ms | **79.70 ms** | 16.29 ms |
| `http_req_waiting` p(95) | 321.45 ms | 302.74 ms | 347.69 ms | **323.96 ms** | 44.95 ms |
| `iterations` | 374 | 374 | 370 | **372.67** | 4 |
| `iteration_duration` avg | 1.76 s | 1.76 s | 1.79 s | **1.77 s** | 0.03 s |
| Data received / sent | 1.2 GB / 331 MB | 1.2 GB / 331 MB | 1.2 GB / 331 MB | — | — |

Runs 1 and 2 are near-identical. Run 3 is the slow one on every latency measure — p(95) 425 ms
against 346/355 ms. Nothing in the configuration changed, so **that ~80 ms swing is pure
run-to-run noise**, which is the single most useful thing these three runs establish.

Health probe after every run: `200` in 34–40 ms.

## Seed and cleanup — all three cycles

| Step | Run 1 | Run 2 | Run 3 |
| --- | --- | --- | --- |
| Seed checks | 836/836 (100%) | 836/836 (100%) | 836/836 (100%) |
| Seed `http_req_failed` | 0.00% (0/816) | 0.00% (0/816) | 0.00% (0/816) |
| Seed requests / data sent | 816 / 122 MB | 816 / 122 MB | 816 / 122 MB |
| Cleanup checks | 28/28 (100%) | 28/28 (100%) | 28/28 (100%) |
| Cleanup `http_req_failed` | 0.00% | 0.00% | 0.00% |

Byte-for-byte identical seeds. The teardown-before-reseed discipline held: no run hit the
non-idempotent seed conflict, because each cycle cleaned up before the next began.

## Per-scenario p(95) — averaged over 3 runs

Sorted slowest first. `fail %` was 0.00 in every scenario in every run.

| Scenario | Run 1 | Run 2 | Run 3 | **Mean p(95)** | Spread | Mean avg | Iters (r1/r2/r3) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `create_remove_group_share_090` | 538.80 ms | 548.12 ms | 543.64 ms | **543.52 ms** | 9.32 ms | 148.93 ms | 14/14/14 |
| `download_050` | 477.41 ms | 485.35 ms | 509.28 ms | **490.68 ms** | 31.87 ms | 135.57 ms | 69/69/68 |
| `create_upload_rename_delete_folder_and_file_040` | 367.46 ms | 393.41 ms | 432.54 ms | **397.80 ms** | 65.08 ms | 141.21 ms | 18/18/18 |
| `create_space_080` | 325.09 ms | 302.82 ms | 431.03 ms | **352.98 ms** | 128.21 ms | 93.50 ms | 25/25/25 |
| `add_remove_tag_100` | 266.64 ms | 306.83 ms | 337.25 ms | **303.57 ms** | 70.61 ms | 101.66 ms | 19/19/18 |
| `navigate_file_tree_020` | 263.60 ms | 240.09 ms | 264.02 ms | **255.90 ms** | 23.93 ms | 43.29 ms | 76/76/75 |
| `sync_client_110` | 251.40 ms | 241.55 ms | 253.27 ms | **248.74 ms** | 11.72 ms | 39.10 ms | 75/75/75 |
| `user_group_search_070` | 214.09 ms | 249.96 ms | 268.51 ms | **244.19 ms** | 54.42 ms | 42.39 ms | 78/78/77 |

Two things stand out:

- **`create_remove_group_share_090` is now the slowest scenario and it is consistently above
  500 ms** — 538/548/543 ms, a spread of only 9 ms. That is not noise; it is a stable
  characteristic. `download_050` sits just under at 490 ms mean, crossing 500 ms in run 3.
  Because the gate is evaluated on the *aggregate* `http_req_duration`, neither fails the run.
- **`create_space_080` is the least reproducible** — 128 ms spread across identical runs. Treat any
  single-run number from it with suspicion.

The read-mostly scenarios (`020`, `070`, `110`) are the fastest and the most stable, all ~39–43 ms
average.

## The suspected latency regression is now conclusively dead

These three runs add samples 3, 4 and 5 for `dd15f601ec1` under the same artifact and config:

| Build | p(95) samples | n | mean | range | stdev |
| --- | --- | --- | --- | --- | --- |
| `dd15f601ec1` | 468.31, 427.06, 345.71, 354.68, 425.44 | 5 | **404.24 ms** | 345.71 – 468.31 | 52.34 ms |
| `13583aba0f2` | 417.31, 375.23 | 2 | 396.27 ms | 375.23 – 417.31 | — |

**Both old-build samples fall inside the new build's range**, and the two means differ by
**~8 ms** — noise. The original flag came from a single new-build sample (468 ms) that we can now
see was simply the high end of a distribution with a 123 ms spread.

The practical lesson: at this scale a single run's p(95) carries roughly **±60 ms** of uncertainty.
Any future build comparison needs 3+ runs per side, or it will invent regressions that do not exist.

## Threshold gate — still not actually armed

As instructed, these runs used `packages/k6-tests/artifacts/koko-platform-000-mixed-ramping-k6.js`.
That artifact is a stale build with **no `thresholds` key**, so `ENABLE_THRESHOLDS=true` and
`THRESHOLD_HTTP_REQ_FAILED="rate<0.02"` had no effect and k6 printed no `THRESHOLDS` block in any of
the three runs.

**So "exit 0" above means "the run completed", not "the gates held."** The pass verdict at the top of
this report rests on the measured data — 0% failures, 100% checks — not on a k6 gate.

Judged against the intended thresholds manually, all three runs would have passed anyway:

| Run | `http_req_failed` vs `rate<0.02` | `http_req_duration` p(95) vs `p(95)<500` |
| --- | --- | --- |
| 1 | 0.00% ✅ | 345.71 ms ✅ (154 ms margin) |
| 2 | 0.00% ✅ | 354.68 ms ✅ (145 ms margin) |
| 3 | 0.00% ✅ | 425.44 ms ✅ (75 ms margin) |

For a genuinely enforced gate use `tests-koko-platform-000-mixed-ramping-k6.js` instead — same
source, current build, thresholds present.

## Cleanup

Cleanup ran after every run as instructed, and the k6 teardown itself passed every time (28/28).
But it **left an orphaned personal drive behind in 2 of the 3 runs**:

| Run | Orphaned drive left by teardown | Action |
| --- | --- | --- |
| 1 | none | — |
| 2 | `perf-test-user-10` | purged manually |
| 3 | `perf-test-user-13` | purged manually |

In both cases the *user* was deleted correctly but their personal space survived as an orphan.
The purge (`DELETE`, then `DELETE` with `Purge: T`) returned **HTTP 500** both times, yet the drive
then disappeared from `/graph/v1.0/drives` and its on-disk directory was gone — the user deletion had
already removed the node metadata, so the space delete errored on missing `.mpk`/`.mlock` files while
still dropping the index entry.

> **This looks like a real ordering bug in the seed teardown, not crash fallout.** All three runs
> were clean and non-crashing. Combined with earlier sessions today (2 orphans in one run, 0 in
> another), the rate is roughly **1 orphan per 20 users, intermittently** — about 5%. Worth filing:
> the teardown should purge each user's personal space *before* deleting the user.
>
> Note this is only visible if you check with a regex that matches the **hyphenated** form
> (`perf-test-user-*`). A filter looking for `perftestuser` misses it entirely.

**Verified final state** after all three cycles:

- Users: **6** — `admin`, `einstein`, `katherine`, `marie`, `moss`, `richard`. 0 perf users.
- Groups: 0 `perf-test-group-*`.
- Drives: **2** — `Admin` (personal) + `Shares` (virtual). **0 orphans.**
- Disk: `~/.ocis/storage` = 8.2 MB, `users/uploads` = **0 B**, one space dir
  (`dcae2f1d-…`, the Admin space). Free space unchanged at 13 GB.
- oCIS **left running** (pid 9366) — it is the user's own instance.

## Reproducing

Each cycle was driven by `/tmp/k6_cycle.sh <n>`, which runs exactly the instructed commands:

```sh
export ADMIN_LOGIN=admin ADMIN_PASSWORD=admin
export PLATFORM_BASE_URL=https://localhost:9200
export AUTH_N_PROVIDER_KOPANO_BASE_URL=https://localhost:9200
export AUTH_N_PROVIDER_KOPANO_REDIRECT_URL=https://localhost:9200/oidc-callback.html

export SEED_USERS_TOTAL=20        # must be >= total peak VUs (16 below)
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

k6 run -q packages/k6-tests/artifacts/_seeds-down-k6.js   # then repeat
```

Deviations from the instructions as given, and why:

- Added `--summary-mode=full --summary-export=...` alongside `-q`. `-q` only disables progress
  updates, but on its own it also hides the per-scenario breakdown — needed here for the averages.
- Captured exit codes from unpiped commands rather than `${pipestatus[1]}` (zsh differs from bash).
- Purged the 2 orphaned personal drives the teardown left behind, so each run started from a
  genuinely clean state rather than inheriting the previous run's leftovers.

### Artifacts

Per run *n* ∈ {1,2,3}: `/tmp/run<n>_seed.log` · `/tmp/run<n>_test.log` ·
`/tmp/run<n>_summary.json` · `/tmp/run<n>_down.log` · cycle driver `/tmp/k6_cycle.sh`

Related: `results-for-k6-load-perf__OCISDEV-900_#1.md` · `results-for-k6-load-perf__OCISDEV-900_#2.md`
· `results-for-k6-load-perf__master.md` · `results-for-ALL-k6-load-perf__master.md`
