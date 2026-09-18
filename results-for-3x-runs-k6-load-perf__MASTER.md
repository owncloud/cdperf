# k6 Load / Performance Results — 3× repeated runs, oCIS `master`

**Date:** 2026-09-17
**Result:** ✅ **3 / 3 PASS** — every run exited 0, 100 % of checks succeeded, 0 % request failures,
server healthy after every run. Seed and cleanup clean in all three cycles, **0 orphans left at the
end**.

## Average time — headline answer

| Phase | Run 1 | Run 2 | Run 3 | **Average** |
| --- | --- | --- | --- | --- |
| Seed (`_seeds-up-k6.js`) | 57 s | 54 s | 53 s | **54.67 s** |
| **Mixed ramping test** | 55 s | 54 s | 55 s | **54.67 s** |
| Cleanup (`_seeds-down-k6.js`) | 10 s | 7 s | 7 s | **8.00 s** |
| **Full cycle** | 122 s | 116 s | 115 s | **117.67 s** (1 m 58 s) |

Counted cycle time for the three runs: **353 s (5 m 53 s)**.

Run windows: run 1 `02:40:40 → 02:42:42`, run 2 `03:20:16 → 03:22:12`, run 3 `03:22:12 → 03:24:07`.
The gap between run 1 and run 2 is a **discarded fourth attempt** — see
[The discarded attempt](#the-discarded-attempt-macos-fell-asleep-mid-run). It is excluded from every
average in this report, and the reason is measurable, not a judgement call.

The test phase is extremely reproducible — 54–55 s, a 1 s spread across three runs. Seed is 53–57 s,
cleanup 7–10 s.

## Environment

| Item | Value |
| --- | --- |
| cdperf commit | `b7a3ac5` (branch `next_local-runs_OCISDEV-900`) |
| k6 | v1.0.0 (go1.24.2, darwin/arm64) |
| Target | Infinite Scale **8.2.0+`13583aba0f2`** — branch **`master`**, verified before each run |
| oCIS binary | `~/Projects/ownCloud/ocis_1/ocis/bin/ocis` (pid 20402, the user's own instance) |
| Host | Mac15,6 · 11 cores · 18 GB RAM · macOS 26.6.2 |
| Execution | local — k6 and oCIS on the same machine |
| Runs orchestrated by | **Claude Code v2.1.273** (CLI, `~/.local/bin/claude`) |
| Model | **Claude Opus 5** — model ID `us.anthropic.claude-opus-5` |

Local `master` is at `13583aba0f2`. Note `origin/master` has moved ahead (`1ba86e64371`), so these
runs measure the **local** master checkout, not the current remote tip.

> **On the tooling attribution:** Claude Code only orchestrated the runs — it invoked the `k6` binary,
> timed the phases, purged the orphaned drive and assembled this report. Every number here comes from
> k6's own `--summary-mode=full` output, the oCIS Graph API and `pmset -g log`, not from the model.
> The raw logs under [Artifacts](#artifacts) let you verify any figure independently.

## Configuration

Identical in all three runs: 8 scenarios × 2 VUs, ramp 10 s up / 30 s peak / 10 s down, 1 s sleep
after each iteration. Peak = **16 VUs**. Seeded 20 users. Driven by a single script so no parameter
could drift between cycles.

Each cycle was **seed → mixed ramping test → cleanup → verify**, exactly as instructed.

## Results per run

| Metric | Run 1 | Run 2 | Run 3 | **Mean** | Spread |
| --- | --- | --- | --- | --- | --- |
| k6 exit code | 0 | 0 | 0 | — | — |
| Checks | 693/693 (100 %) | 692/692 (100 %) | 694/694 (100 %) | — | — |
| `http_req_failed` | 0.00 % (0/655) | 0.00 % (0/654) | 0.00 % (0/656) | **0.00 %** | — |
| `http_reqs` | 655 | 654 | 656 | **655.0** | 2 |
| Requests/s | 12.26 | 12.23 | 12.29 | **12.26** | 0.06 |
| `http_req_duration` avg | 91.83 ms | 88.38 ms | 88.54 ms | **89.58 ms** | 3.45 ms |
| median | 34.43 ms | 34.27 ms | 36.13 ms | **34.94 ms** | 1.86 ms |
| p(90) | 260.78 ms | 273.81 ms | 249.78 ms | **261.46 ms** | 24.03 ms |
| **p(95)** | **373.92 ms** | **349.03 ms** | **327.23 ms** | **350.06 ms** | **46.69 ms** |
| max | 694.27 ms | 717.40 ms | 664.98 ms | — | — |
| `http_req_waiting` avg | 81.19 ms | 77.88 ms | 77.99 ms | **79.02 ms** | 3.31 ms |
| `http_req_waiting` p(95) | 332.67 ms | 321.91 ms | 296.53 ms | **317.04 ms** | 36.14 ms |
| `iterations` | 373 | 372 | 374 | **373.0** | 2 |
| `iteration_duration` avg | 1.78 s | 1.77 s | 1.77 s | **1.77 s** | 0.01 s |
| Data received / sent | 1.2 GB / 331 MB | 1.2 GB / 331 MB | 1.2 GB / 331 MB | — | — |

Health probe after every test: `200` in **33–41 ms**.

Throughput, iteration counts and averages are near-identical (avg spread 3.45 ms, median 1.86 ms).
Only the tail moves: p(95) drifts down 374 → 349 → 327 ms across the three runs, a 47 ms spread —
consistent with the ±60 ms single-run uncertainty established earlier.

## Seed and cleanup — all three cycles

| Step | Run 1 | Run 2 | Run 3 |
| --- | --- | --- | --- |
| Seed checks | 836/836 (100 %) | 836/836 (100 %) | 836/836 (100 %) |
| Seed `http_req_failed` | 0.00 % (0/816) | 0.00 % (0/816) | 0.00 % (0/816) |
| Seed requests / data sent | 816 / 122 MB | 816 / 122 MB | 816 / 122 MB |
| Seed `http_req_duration` avg | 65.75 ms | 64.10 ms | 63.72 ms |
| Seed throughput | 15.08 req/s | 15.47 req/s | 15.57 req/s |
| Cleanup checks | 28/28 (100 %) | 28/28 (100 %) | 28/28 (100 %) |
| Cleanup `http_req_failed` | 0.00 % | 0.00 % | 0.00 % |
| Cleanup `http_req_duration` avg | 317.97 ms | 238.69 ms | 218.14 ms |

Byte-for-byte identical seeds. The teardown-before-reseed discipline held: no cycle hit the
non-idempotent seed conflict.

## Per-scenario p(95) — averaged over 3 runs

Sorted slowest first. `fail %` was **0.00 in every scenario in every run**.

| Scenario | Run 1 | Run 2 | Run 3 | **Mean p(95)** | Spread | Mean avg | Iters (r1/r2/r3) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `download_050` | 515.09 ms | 531.50 ms | 512.95 ms | **519.85 ms** | 18.55 ms | 142.22 ms | 68/68/69 |
| `create_remove_group_share_090` | 437.28 ms | 408.14 ms | 490.44 ms | **445.29 ms** | 82.30 ms | 140.25 ms | 14/14/14 |
| `create_upload_rename_delete_folder_and_file_040` | 421.62 ms | 386.32 ms | 337.11 ms | **381.68 ms** | 84.51 ms | 139.46 ms | 18/18/18 |
| `create_space_080` | 415.02 ms | 324.02 ms | 299.01 ms | **346.02 ms** | 116.01 ms | 94.89 ms | 25/25/25 |
| `add_remove_tag_100` | 348.19 ms | 298.58 ms | 275.13 ms | **307.30 ms** | 73.06 ms | 99.68 ms | 19/19/19 |
| `user_group_search_070` | 258.21 ms | 250.06 ms | 250.89 ms | **253.05 ms** | 8.15 ms | 44.39 ms | 78/78/78 |
| `navigate_file_tree_020` | 224.72 ms | 277.82 ms | 222.53 ms | **241.69 ms** | 55.29 ms | 44.95 ms | 76/75/76 |
| `sync_client_110` | 219.09 ms | 189.16 ms | 245.43 ms | **217.89 ms** | 56.27 ms | 38.05 ms | 75/75/75 |

Two things worth carrying forward:

- **`download_050` is consistently over 500 ms** — 515/531/513 ms, spread only 19 ms. That is not
  noise; it is a stable property of this build at 16 VUs. It is also the *only* scenario above
  500 ms. Because the gate is evaluated on the **aggregate** `http_req_duration`, it does not fail
  the run on its own.
- **`create_space_080` is again the least reproducible** — 116 ms spread across identical runs. Same
  finding as the branch runs. Do not draw conclusions from a single `080` number.

Read-mostly scenarios (`020`, `070`, `110`) remain fastest and steadiest at 38–45 ms average.

## The discarded attempt: macOS fell asleep mid-run

The first attempt at run 2 (`02:43:06 → 03:17:12`, 2046 s) is **excluded**. It was not an oCIS
problem — the host went to sleep twice, proven by `pmset -g log`:

| Phase | Measured | Sleep event from `pmset -g log` | Real work |
| --- | --- | --- | --- |
| Seed | 960 s | `Idle Sleep … 907 secs` at 02:43:49 → `DarkWake` 02:58:56 | ≈ 53 s |
| Test | 55 s | (awake throughout) | 55 s |
| Cleanup | 1030 s | `Maintenance Sleep … 1025 secs` at 03:00:01 → `DarkWake` 03:17:06 | ≈ 5 s |

The seed's own metrics corroborate it exactly: `http_req_duration max=15m5s` and
`http_req_waiting max=15m5s` — **one** request stalled, and 15 m 5 s matches the 907 s sleep window
to within 2 s. Everything else in that seed was normal (816 reqs, 0.00 % failures, med 63.52 ms).

Its **test phase is clean and usable** as a supplementary sample: 691/691 checks, 0.00 % failures,
653 reqs, avg 86.82 ms, med 29.35 ms, p(90) 263.22 ms, **p(95) 322.00 ms**, max 661.14 ms. Adding it
gives four master test samples with p(95) = 373.92 / 349.03 / 327.23 / 322.00 ms, **mean 343.05 ms**.

Runs 2 and 3 were then re-run under `caffeinate -dimsu` so the machine could not sleep. Both
completed with no stall of any kind. **Lesson for any future overnight run on this laptop: wrap the
whole cycle in `caffeinate -dimsu`, not a timed `caffeinate -i -t N`** — the timed assertion expired
mid-seed, which is exactly how this happened.

## Threshold gate — still not actually armed

As instructed, these runs used `packages/k6-tests/artifacts/koko-platform-000-mixed-ramping-k6.js`.
That artifact is a stale build with **no `thresholds` key**, so `ENABLE_THRESHOLDS=true` and
`THRESHOLD_HTTP_REQ_FAILED="rate<0.02"` had no effect and k6 printed no `THRESHOLDS` block in any of
the three runs.

**So "exit 0" above means "the run completed", not "the gates held."** The pass verdict at the top of
this report rests on the measured data — 0 % failures, 100 % checks — not on a k6 gate.

Judged manually against the intended thresholds, all three runs pass with comfortable margin:

| Run | `http_req_failed` vs `rate<0.02` | `http_req_duration` p(95) vs `p(95)<500` |
| --- | --- | --- |
| 1 | 0.00 % ✅ | 373.92 ms ✅ (126 ms margin) |
| 2 | 0.00 % ✅ | 349.03 ms ✅ (151 ms margin) |
| 3 | 0.00 % ✅ | 327.23 ms ✅ (173 ms margin) |

For a genuinely enforced gate use `tests-koko-platform-000-mixed-ramping-k6.js` instead — same
source, current build, thresholds present.

## master vs the `chore/OCISDEV-900-reva-bump` branch

Same host, same cdperf commit, same config, 3 clean runs on each side. Branch numbers come from
[`results-for-3x-runs-k6-load-perf__OCISDEV-900.md`](results-for-3x-runs-k6-load-perf__OCISDEV-900.md).

### Mixed test — no meaningful difference

| Measure | `master` (`13583aba0f2`) | branch (`dd15f601ec1`) | Δ |
| --- | --- | --- | --- |
| p(95) mean | **350.06 ms** (327–374) | 375.28 ms (346–425) | −25 ms |
| avg | 89.58 ms | 89.80 ms | −0.2 ms |
| median | 34.94 ms | 30.73 ms | +4.2 ms |
| p(90) | 261.46 ms | 264.01 ms | −2.6 ms |
| Requests/s | 12.26 | 12.26 | 0 |

The p(95) ranges **overlap** (327–374 vs 346–425) and avg/throughput are identical to within
rounding. Given the ±60 ms single-run uncertainty already established, this is **noise, not a
difference.** This is consistent with the earlier finding that retired the suspected regression.

### Seed (upload-heavy) — a real, non-overlapping gap ⚠️

| Measure | `master` (3 runs) | branch (3 runs) | Δ |
| --- | --- | --- | --- |
| Seed wall clock | **53 / 54 / 57 s** | 80 / 89 / 80 s | ~**1.5× slower on branch** |
| Seed `http_req_duration` avg | **63.72 / 64.10 / 65.75 ms** | 95.04 / 96.57 / 107.09 ms | ~+40 ms |
| Seed median | **64.25 / 64.84 / 65.39 ms** | 76.80 / 105.55 / 117.14 ms | ~+40 ms |
| Seed p(95) | **82.93 / 83.60 / 86.44 ms** | 166.93 / 171.10 / 177.95 ms | ~**2× slower** |
| Seed throughput | **15.08–15.57 req/s** | 9.29–10.47 req/s | ~−35 % |

Unlike the mixed-test comparison, **every one of these ranges is non-overlapping across 3+3
samples**, and the effect shows up in per-request latency, not just wall clock — so it is not a
timing artifact of the harness. The seed is dominated by **122 MB of uploads via plain WebDAV `PUT`**
(`packages/k6-tdk/src/client/resource.ts:61-71` — no TUS), which is exactly the code path the reva
bump touches.

**This is worth investigating, but it is not yet proven.** The honest caveats:

- The two sets ran at different times (branch ~20:41, master ~02:40–03:24) on a laptop shared with
  everything else, so they are two *blocks*, not an interleaved A/B.
- Disk fill differed slightly (13 Gi vs 12 Gi free, 97 % → 98 %).
- The mixed test, which also uploads, shows no such gap — so if the upload path is slower, the mixed
  profile at 16 VUs does not surface it.

To settle it: run the seed alone, alternating builds A/B/A/B/A/B, 5+ samples each. That is the same
methodology that correctly killed the earlier false regression, and it is cheap here — the seed is
under a minute per sample.

## Checks exercised

All passed in all three runs. Auth: `logonResponse`, `authorizeResponse`, `accessTokenResponse`.
Client: `role.getMyDrives`, `search.searchForSharees`, `application.createDrive`,
`resource.createResource`, `resource.getResourceProperties`, `resource.downloadResource`,
`resource.uploadResource`, `resource.moveResource`, `resource.deleteResource`,
`drive.deactivateDrive`, `drive.deleteDrive`, `share.createShare`, `share.deleteShare`,
`tag.addTagToResource`, `tag.removeTagToResource`.

**Skipped (2, in every run):** `tag.getTags`, `tag.createTag` — reported SKIPPED by k6, not executed.
This is a property of the stale artifact, not of the build; the current
`tests-`prefixed artifact skips nothing.

`030-search-for-filename` is commented out in `000-mixed/ramping.k6.ts`, so 8 of the 9 exported
scenarios ran. The `030` env vars were correctly omitted from the loop.

## Cleanup

Cleanup ran after every run as instructed, and the k6 teardown passed every time (28/28, 0 %
failures). It left **one orphaned personal drive in 1 of the 3 runs**:

| Run | Orphaned drive left by teardown | Action |
| --- | --- | --- |
| 1 | `perf-test-user-16` | purged manually |
| 2 | none | — |
| 3 | none | — |

The *user* was deleted correctly but their personal space survived. The purge (`DELETE`, then
`DELETE` with `Purge: T`) returned **HTTP 500** — yet the drive then disappeared from
`/graph/v1.0/drives` and its on-disk directory was gone. The user deletion had already removed the
node metadata, so the space delete errors on missing `.mpk`/`.mlock` files while still dropping the
index entry.

> **Same ordering bug as on the branch — it is not branch-specific.** master leaked 1 orphan in 3
> runs here; the branch leaked 2 in 3. All runs were clean and non-crashing, so this is not crash
> fallout. Combined rate across both sets is roughly **1 orphan per 20 users, intermittently (~5 %)**.
> Worth filing: teardown should purge each user's personal space *before* deleting the user.
>
> Only visible with a regex matching the **hyphenated** form (`perf-test-user-*`). A filter looking
> for `perftestuser` misses it entirely.

**Verified final state** after all cycles:

- Users: **6** — `admin`, `einstein`, `katherine`, `marie`, `moss`, `richard`. 0 perf users.
- Groups: 0 `perf-test-group-*` (only the 8 demo groups remain).
- Drives: **2** — `Admin` (personal) + `Shares` (virtual). **0 orphans.**
- Disk: `~/.ocis/storage` = 6.0 MB, `users/uploads` = **0 B**. Free space 12 Gi (98 % used).
- oCIS **left running** (pid 20402, health `200` in 4.7 ms) — it is the user's own instance.

## Reproducing

Each cycle was driven by `/tmp/k6_cycle_master.sh <n>`, which runs exactly the instructed commands:

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
  updates, but on its own it also hides the per-scenario breakdown — needed for the averages above.
- Captured exit codes from unpiped commands rather than `${pipestatus[1]}` (zsh differs from bash).
- Wrapped runs 2 and 3 in `caffeinate -dimsu` after the host slept through the first attempt at
  run 2. This changes nothing about the workload; it only stops the OS suspending it.
- Purged the orphaned personal drive the teardown left after run 1, so run 2 started from a
  genuinely clean state.
- Discarded the sleep-contaminated attempt and re-ran it, rather than averaging a 2046 s cycle that
  was 1932 s of suspended laptop.

### Artifacts

Counted runs — `/tmp/m1_*` (run 1), `/tmp/m2b_*` (run 2), `/tmp/m3_*` (run 3), each with
`_seed.log` · `_test.log` · `_summary.json` · `_down.log` · `_users.json` · `_groups.json` ·
`_drives.json`. Discarded attempt: `/tmp/m2_*`. Drivers: `/tmp/k6_cycle_master.sh`,
`/tmp/purge_orphans.sh`.

Related: `results-for-3x-runs-k6-load-perf__OCISDEV-900.md` (the branch counterpart) ·
`results-for-k6-load-perf__OCISDEV-900_#1.md` · `results-for-k6-load-perf__OCISDEV-900_#2.md` ·
`results-for-k6-load-perf__master.md` · `results-for-ALL-k6-load-perf__master.md`
