# Comparison — oCIS `master` vs `chore/OCISDEV-900-reva-bump`

**Date:** 2026-09-17
**Question:** by what percentage is the OCISDEV-900 build slower than master?

**Answer: it depends on the workload.** ~**52 % slower** on the upload-heavy seed (2× at the tail),
and **~0 %** — statistically indistinguishable — on the mixed ramping test.

| Workload | Branch (`dd15f601ec1`) vs master (`13583aba0f2`) | Verdict |
| --- | --- | --- |
| **Seed / upload-heavy** | **+51.8 %** wall clock, **+54.3 %** avg latency, **+104 %** p(95) | ⚠️ real, non-overlapping |
| **Mixed ramping test** | **+0.25 %** avg, +7.2 % p(95), −12.1 % median | ✅ noise, no difference |
| Cleanup | +8.4 % | noise (overlapping ranges) |
| Full cycle | +24.4 % | seed dragging the total |

## Sources

| | master | branch |
| --- | --- | --- |
| Report | [`results-for-3x-runs-k6-load-perf__MASTER.md`](results-for-3x-runs-k6-load-perf__MASTER.md) | [`results-for-3x-runs-k6-load-perf__OCISDEV-900.md`](results-for-3x-runs-k6-load-perf__OCISDEV-900.md) |
| oCIS build | `8.2.0+13583aba0f2` (branch `master`, local) | `8.2.0+dd15f601ec1` (branch `chore/OCISDEV-900-reva-bump`) |
| Runs | 3 clean cycles, 2026-09-17 02:40–03:24 | 3 clean cycles, 2026-09-16 20:41–20:49 |
| cdperf commit | `b7a3ac5` | `b7a3ac5` |
| k6 | v1.0.0 (go1.24.2, darwin/arm64) | same |
| Config | 8 scenarios × 2 VUs, 10s/30s/10s, 1s sleep, peak 16 VUs, 20 seeded users | identical |
| Host | Mac15,6 · 11 cores · 18 GB RAM · macOS 26.6.2, k6 + oCIS co-located | same |

All percentages below are computed as `(branch − master) / master`, so **positive = branch slower**.

## Phase wall clock

| Phase | master (mean of 3) | branch (mean of 3) | Δ | **Branch slower by** |
| --- | --- | --- | --- | --- |
| Seed (`_seeds-up-k6.js`) | 54.67 s (53 / 54 / 57) | 83.00 s (80 / 89 / 80) | +28.33 s | **+51.8 %** |
| Mixed ramping test | 54.67 s (55 / 54 / 55) | 54.67 s (55 / 54 / 55) | 0 s | **0.0 %** |
| Cleanup (`_seeds-down-k6.js`) | 8.00 s (10 / 7 / 7) | 8.67 s (8 / 9 / 9) | +0.67 s | +8.4 % |
| **Full cycle** | **117.67 s** | **146.33 s** | +28.66 s | **+24.4 %** |

The test phase is identical to the second — which is itself a useful control: the harness, the host
and the timing method are not the variable. The whole +24.4 % on the cycle comes from the seed.

## Seed — the real signal ⚠️

The seed uploads 122 MB (small/medium/large fixtures) via **plain WebDAV `PUT`**, no TUS
(`packages/k6-tdk/src/client/resource.ts:61-71`), plus 20 user creations — 816 requests, identical
byte-for-byte in both sets.

| Measure | master | branch | **Branch slower by** |
| --- | --- | --- | --- |
| Wall clock | **54.67 s** | 83.00 s | **+51.8 %** |
| `http_req_duration` avg | **64.52 ms** | 99.57 ms | **+54.3 %** |
| median | **64.83 ms** | 99.83 ms | **+54.0 %** |
| p(95) | **84.32 ms** | 171.99 ms | **+104.0 %** (2.04×) |
| Throughput | **15.37 req/s** | 10.02 req/s | −34.8 % throughput → **+53.4 % time per request** |
| Requests / data sent | 816 / 122 MB | 816 / 122 MB | — |
| `http_req_failed` | 0.00 % | 0.00 % | — |
| Checks | 836/836 | 836/836 | — |

Per-run values, so you can see the separation yourself:

| Run | master wall | branch wall | master avg | branch avg | master p(95) | branch p(95) |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 57 s | 80 s | 65.75 ms | 95.04 ms | 86.44 ms | 166.93 ms |
| 2 | 54 s | 89 s | 64.10 ms | 96.57 ms | 83.60 ms | 171.10 ms |
| 3 | 53 s | 80 s | 63.72 ms | 107.09 ms | 82.93 ms | 177.95 ms |
| range | **53–57** | **80–89** | **63.7–65.8** | **95.0–107.1** | **82.9–86.4** | **166.9–178.0** |

**Every range is non-overlapping across 3 + 3 samples**, and the gap appears in per-request latency,
not just wall clock — so it is not an artifact of how the phases were timed. Worst separation is at
p(95): the slowest master sample (86.44 ms) is still **half** the fastest branch sample (166.93 ms).

## Mixed ramping test — no difference

| Measure | master (mean of 3) | branch (mean of 3) | Δ | Branch slower by |
| --- | --- | --- | --- | --- |
| `http_req_duration` avg | 89.58 ms | 89.80 ms | +0.22 ms | **+0.25 %** |
| median | 34.94 ms | 30.73 ms | −4.21 ms | **−12.05 %** (branch *faster*) |
| p(90) | 261.46 ms | 264.01 ms | +2.55 ms | +0.98 % |
| p(95) | 350.06 ms | 375.28 ms | +25.22 ms | +7.20 % |
| `http_req_waiting` avg | 79.02 ms | 79.70 ms | +0.68 ms | +0.86 % |
| `http_req_waiting` p(95) | 317.04 ms | 323.96 ms | +6.92 ms | +2.18 % |
| Requests/s | 12.26 | 12.26 | 0 | **0.0 %** |
| `http_reqs` | 655.0 | 654.0 | −1 | — |
| `iterations` | 373.0 | 372.67 | — | — |
| `iteration_duration` avg | 1.77 s | 1.77 s | 0 | **0.0 %** |
| `http_req_failed` | 0.00 % | 0.00 % | — | — |

Why the +7.2 % at p(95) is **not** a regression:

- The p(95) ranges **overlap**: master 327.23–373.92 ms, branch 345.71–425.44 ms.
- Both reports independently established **±60 ms** of single-run uncertainty at p(95) at this scale.
  +25 ms is well inside it.
- The **median moves the opposite way** (branch 12 % *faster*). A genuine slowdown moves the centre
  and the tail together.
- Throughput, iteration count and iteration duration are identical to within rounding.

Using master's 4-sample p(95) mean instead (343.05 ms, including the clean test phase of the
discarded sleep-hit cycle) gives +9.4 % — still inside the noise band.

## Per-scenario — the alternating signs confirm noise

Mean p(95) over 3 runs each, sorted by branch-slower-first:

| Scenario | master | branch | **Branch slower by** | Mean avg: master → branch |
| --- | --- | --- | --- | --- |
| `create_remove_group_share_090` | 445.29 ms | 543.52 ms | **+22.06 %** | 140.25 → 148.93 ms (+6.19 %) |
| `sync_client_110` | 217.89 ms | 248.74 ms | **+14.16 %** | 38.05 → 39.10 ms (+2.76 %) |
| `navigate_file_tree_020` | 241.69 ms | 255.90 ms | +5.88 % | 44.95 → 43.29 ms (−3.69 %) |
| `create_upload_rename_delete_folder_and_file_040` | 381.68 ms | 397.80 ms | +4.22 % | 139.46 → 141.21 ms (+1.25 %) |
| `create_space_080` | 346.02 ms | 352.98 ms | +2.01 % | 94.89 → 93.50 ms (−1.46 %) |
| `add_remove_tag_100` | 307.30 ms | 303.57 ms | −1.21 % | 99.68 → 101.66 ms (+1.99 %) |
| `user_group_search_070` | 253.05 ms | 244.19 ms | −3.50 % | 44.39 → 42.39 ms (−4.51 %) |
| `download_050` | 519.85 ms | 490.68 ms | **−5.61 %** (branch faster) | 142.22 → 135.57 ms (−4.68 %) |

Three scenarios are *faster* on the branch and five slower; `020`, `080` and `100` even disagree
between their p(95) and their average. That pattern is noise. Note also that `download_050` — the
most upload/download-bound scenario in the mix — is the one where the branch is **fastest**, which
cuts directly against reading the seed gap into the mixed test.

Their own per-run spreads dwarf the deltas: `create_space_080` alone varies 116 ms (master) and
128 ms (branch) across identical runs.

## Correctness — identical, no difference at all

| | master | branch |
| --- | --- | --- |
| Runs passed | 3 / 3, all exit 0 | 3 / 3, all exit 0 |
| Checks | 693 / 692 / 694 — 100 % | 694 / 694 / 686 — 100 % |
| `http_req_failed` (test) | 0.00 % | 0.00 % |
| `http_req_failed` (seed) | 0.00 % | 0.00 % |
| Health after test | 200 in 33–41 ms | 200 in 34–40 ms |
| Skipped checks | 2 (`tag.getTags`, `tag.createTag`) | 2 — same, artifact-related |
| Orphaned drives left by teardown | 1 of 3 runs | 2 of 3 runs |

**Neither build fails anything.** The reva bump introduces no errors at 16 VUs — this is purely a
latency comparison. The orphan leak is present in both, so it is not branch-specific (~1 per 20
users, ~5 %).

## Threshold gate — inert on both sides

Both sets used the stale artifact `koko-platform-000-mixed-ramping-k6.js`, which has **no
`thresholds` key**, so `ENABLE_THRESHOLDS=true` and `THRESHOLD_HTTP_REQ_FAILED="rate<0.02"` had no
effect and k6 printed no `THRESHOLDS` block in any of the six runs. Exit 0 means "completed", not
"gates held". Judged manually against `p(95)<500` and `rate<0.02`:

| Run | master p(95) | branch p(95) |
| --- | --- | --- |
| 1 | 373.92 ms ✅ | 345.71 ms ✅ |
| 2 | 349.03 ms ✅ | 354.68 ms ✅ |
| 3 | 327.23 ms ✅ | 425.44 ms ✅ |

All six pass with margin; `http_req_failed` was 0.00 % everywhere. The comparison is apples-to-apples
in that both sides are ungated in exactly the same way.

## Limits of this comparison — read before quoting a number

1. **Two blocks, not an interleaved A/B.** The branch ran ~20:41 on 2026-09-16; master ran
   ~02:40–03:24 on 2026-09-17. Anything that changed on the host between those windows is folded into
   the delta. This is the same methodological weakness that produced — and then retired — an earlier
   false "regression" claim on this build.
2. **Disk fill differed:** 13 Gi free / 97 % used (branch) vs 12 Gi free / 98 % used (master). The
   seed writes 122 MB, so a nearly-full APFS volume is a plausible confounder for exactly the metric
   that moved. It happens to work *against* the branch-is-slower reading (master ran on the fuller
   disk and was still faster), but it is uncontrolled either way.
3. **Laptop, shared cores.** k6 and oCIS compete for 11 cores; absolute numbers are not portable to
   a server.
4. **Short runs.** ~650 requests per test phase, so percentiles are thin — hence the ±60 ms.
5. **Local master, not remote tip.** `origin/master` is at `1ba86e64371`; these runs measure the
   local checkout `13583aba0f2`.

## How to settle the seed gap properly

The seed gap is big and clean enough to act on, but it is one block against another. To turn it into
a fact:

```sh
# ~10 minutes total; alternate builds, 5+ samples each, seed only
export ADMIN_LOGIN=admin ADMIN_PASSWORD=admin
export PLATFORM_BASE_URL=https://localhost:9200
export AUTH_N_PROVIDER_KOPANO_BASE_URL=https://localhost:9200
export AUTH_N_PROVIDER_KOPANO_REDIRECT_URL=https://localhost:9200/oidc-callback.html
export SEED_USERS_TOTAL=20

# for each sample: seed, record wall clock + http_req_duration, tear down, switch build, repeat
caffeinate -dimsu k6 run -q packages/k6-tests/artifacts/_seeds-up-k6.js --summary-mode=full
caffeinate -dimsu k6 run -q packages/k6-tests/artifacts/_seeds-down-k6.js
```

Alternate A/B/A/B/A/B rather than running all of one build then all of the other, and keep
`caffeinate -dimsu` around every phase — an expired timed `caffeinate` is what corrupted one master
cycle with a 15-minute idle-sleep stall (documented in the master report).

If the ~50 % gap survives interleaving, the place to look is the upload path the reva bump touches:
plain WebDAV `PUT` handling, and the `pkg/upload` coordinator / session / postprocessing layers.

## Bottom line

> The OCISDEV-900 build is **~52 % slower than master on upload-heavy work** (2× slower at p(95)),
> and **not measurably slower on the mixed 16-VU profile** (+0.25 % average; the +7 % at p(95) is
> inside this setup's ±60 ms noise, and the median is 12 % *faster*). Correctness is identical: 6/6
> runs, 100 % checks, 0 % failures on both builds.

---

### Provenance

Assembled by **Claude Code v2.1.273**, model **Claude Opus 5** (`us.anthropic.claude-opus-5`), from
the two report files named under [Sources](#sources). Every input figure is k6
`--summary-mode=full` output or oCIS Graph API data; the percentages here are arithmetic on those
figures. Raw logs: `/tmp/m1_*`, `/tmp/m2b_*`, `/tmp/m3_*` (master) and `/tmp/run1_*`, `/tmp/run2_*`,
`/tmp/run3_*` (branch).
