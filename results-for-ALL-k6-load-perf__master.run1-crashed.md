# k6 Load / Performance Results — ALL, `master` (300 VU run)

**Date:** 2026-09-16
**testId tag:** `C7A8D332-3A89-484B-813A-666A9DDEBDB1`

## Result

| Step | Outcome |
| --- | --- |
| Test 1 — seed 300 users | ✅ **PASS** — 1956/1956 checks, 0% request failures |
| Test 2 — mixed ramping, 300 VUs, ~22 min | ❌ **VOID — target crashed** at ~236 VUs, 3m56s in |
| Cleanup — `_seeds-down-k6.js` | ✅ **PASS** — 308/308 checks (after restarting oCIS) |

> **The oCIS server process died during ramp-up and never came back on its own.**
> The mixed run produced no usable performance measurement: 99.26% of its 566,929
> requests failed, and 533,718 of those were `connection refused` against a dead port.
> This is a **server availability failure, not a latency result** — do not read the
> percentiles below as performance data.

## Environment

| Item | Value |
| --- | --- |
| cdperf commit | `c493ddc` (branch `next`) |
| k6 | v1.0.0 (go1.24.2, darwin/arm64) |
| Target | Infinite Scale **8.2.0+13583aba0f2** (dev build from source), `https://localhost:9200` |
| oCIS binary | `/Users/deyan.zhekov/Projects/ownCloud/ocis_1/ocis/bin/ocis` |

There are **three** oCIS binaries on this machine; only `ocis_1` is the one under test —
identified by an exact build-hash match against the live pre-crash `status.php`, corroborated
by its mtime (Sep 16 14:24) matching the creation of `~/.ocis/config/ocis.yaml`:

| Binary | Version | |
| --- | --- | --- |
| `LOCAL_TESTS/ocis` | 7.3.1+2ef3f66992b | different release |
| `ocis_2/ocis/bin/ocis` | 8.2.0+`1a973dbcf13` | same version, **different commit** |
| `ocis_1/ocis/bin/ocis` | 8.2.0+`13583aba0f2` | ✅ **the one that ran and crashed** |

All three share the same `~/.ocis` config/data directory, so starting the wrong one would
silently serve the same data under different code — worth checking before any re-run.
| Host | Mac15,6 · 11 cores · macOS 26.6.2 |
| Execution | local — k6 and oCIS on the same machine, competing for the same 11 cores |

## Load profile as configured

8 scenarios, `ramping-vus`, `startVUs: 0`, linear ramp 5m up → 15m peak → 2m down (22 min).

| Scenario | Peak VUs | Sleep after iteration |
| --- | --- | --- |
| `020` navigate-file-tree | 40 | 10s |
| `040` create-upload-rename-delete | 20 | 20s |
| `050` download | 20 | 15s |
| `070` user-group-search | 80 | 10s |
| `080` create-space | 20 | 10s |
| `090` create-remove-group-share | 20 | 15s |
| `100` add-remove-tag | 20 | 15s |
| `110` sync-client | 80 | 10s |
| **Total** | **300** | — |

Thresholds: `ENABLE_THRESHOLDS=true`, `THRESHOLD_HTTP_REQ_FAILED=rate<0.02`,
plus the repo default `THRESHOLD_HTTP_REQ_DURATION=p(95)<500`.

## Test 1 — seed (300 users)

| Metric | Value |
| --- | --- |
| Checks | **1956 / 1956 (100.00%)** |
| `http_req_failed` | 0.00% (0 / 1656) |
| `http_req_duration` | avg 80.83 ms · med 80.22 ms · p(90) 106.10 ms · p(95) 115.36 ms · max 641.09 ms |
| Duration | 2m16s (15:08:57 → 15:11:13) |
| Data sent | 124 MB |

Seeding 300 users is healthy and shows no strain — worth noting, since it is the same
server that fell over minutes later under concurrent read/write load.

## Test 2 — crash timeline

| Time | Event |
| --- | --- |
| 15:11:38 | Run starts, VUs ramping from 0 |
| 15:13:28 – 15:14:28 | Health probe `200`, 39–79 ms — server healthy |
| 15:15:00 | Health probe `200` but **1.319 s** — first sign of saturation |
| 15:15:31 | Health probe `200`, 311 ms — last successful response |
| **15:15:34** | **First failures: 17 × `EOF` on in-flight requests — server dropped live connections** |
| 15:16:01 onward | Health probe `000`, `curl_exit=7`; **nothing listening on :9200** |
| 15:24:23 | Run manually terminated (12 min of pure `connection refused` remained) |

**VUs at crash:** the crash landed 236 s into the 300 s linear ramp — 78.7% of the way up,
so roughly **236 of the 300 target VUs** (~31 on `020`, ~63 each on `070`/`110`, ~16 each on
the five 20-VU scenarios).

**Failure mode:** 17 `EOF` errors, then 533,718 `connection refused`. The `EOF` burst before
the refusals means the process died abruptly with connections open — it did not shed load,
drain, or return 5xx. Afterwards no oCIS process existed at all and no port was bound.

**Cause not established.** No crash log survives: oCIS was started outside this session and
its stdout/stderr were not captured anywhere on disk, and macOS `log show` recorded no OOM /
`memorystatus` kill for it. Memory was at 34% free afterwards. So the crash is confirmed and
precisely timed, but **why** it exited is still open — see Next steps.

## Test 2 — metrics (failure data, not performance data)

Totals at the point of termination:

| Metric | Value |
| --- | --- |
| Checks | 4,327 / 566,882 succeeded — **0.76%** |
| `http_reqs` | 566,929 (750.6 /s — inflated: failing instantly, not doing work) |
| `http_req_failed` | **99.26%** (562,784 / 566,929) |
| Successful requests | 4,145 |
| `iterations` | 541,418 (716.8 /s — spinning on immediate errors) |
| `vus` | max 300 |
| Data received / sent | 1.8 GB / 1.2 GB |

`authn -> logonResponse` succeeded **225** times against **521,903** failures — once the IDP
was gone, every VU failed at login, which is why iteration counts exploded.

The only latency figures with any meaning are those tagged `expected_response:true`, i.e. the
~4,145 requests served in the healthy first ~3.5 minutes (up to ~236 VUs):

`avg 197.85 ms · med 46.47 ms · p(90) 395.64 ms · p(95) 833.29 ms · max 7.54 s`

Even this partial sample already **breaches** the default `p(95)<500` threshold, and the
`max 7.54 s` plus the 1.319 s health probe at 15:15:00 show the server was in trouble
before it died. Treat this as suggestive of saturation near ~200+ VUs, not a measurement.

### Per-scenario (all void — recorded for completeness)

| Scenario | Checks OK | Reqs | Fail % |
| --- | --- | --- | --- |
| `sync_client_110` | 1127 / 144,665 (0.77%) | 144,727 | 99.22 |
| `user_group_search_070` | 870 / 143,389 (0.60%) | 143,448 | 99.39 |
| `navigate_file_tree_020` | 456 / 69,246 (0.65%) | 69,279 | 99.34 |
| `add_remove_tag_100` | 507 / 66,597 (0.76%) | 66,431 | 99.51 |
| `create_remove_group_share_090` | 450 / 39,377 (1.14%) | 39,389 | 98.85 |
| `create_space_080` | 418 / 35,388 (1.18%) | 35,404 | 98.81 |
| `create_upload_rename_delete_folder_and_file_040` | 335 / 34,527 (0.97%) | 34,542 | 99.03 |
| `download_050` | 164 / 33,693 (0.48%) | 33,709 | 99.51 |

**Threshold verdict:** `http_req_failed` at 99.26% versus a `rate<0.02` gate — a breach by
roughly 50×. k6 was terminated by signal so it exited on the signal rather than emitting
99; run to completion this configuration is an unambiguous CI failure.

## Secondary finding — a test-suite robustness bug

Independent of the outage, `100-add-remove-tag` threw **30,086** instances of:

```
Uncaught (in promise) Error: Element name cannot be null. node: <#document>
  at packages/k6-tdk/src/utils/query.ts:27
  at add_remove_tag_100 (packages/k6-tests/tests/koko/platform/100-add-remove-tag/simple.k6.ts:72)
```

`query.ts` feeds the response body to the XML parser without guarding against an empty
body, so any empty/truncated response becomes an opaque parser error instead of a failed
check. That turns a server problem into a confusing test-code stack trace and buries the
real signal. Worth a guard in `query.ts` regardless of this run's outcome.

## Cleanup

The requested `_seeds-down-k6.js` **could not run initially** — it needs a live server, and
the server was dead. Sequence actually performed:

1. Restarted oCIS from `ocis_1/ocis/bin/ocis` with `PROXY_ENABLE_BASIC_AUTH=true`
   (the first restart attempt omitted this and Graph returned 401 — the original instance
   evidently had basic auth enabled).
2. Confirmed all **300 seed users survived** the crash — no data loss.
3. Ran `_seeds-down-k6.js` with `SEED_USERS_TOTAL=300` → **308/308 checks, 0% failures**.
4. Removed **4 orphaned project spaces** the crashed run left behind
   (`080` created 127 spaces but only deleted 123): `perftestuser163-iteration-5`,
   `perftestuser101-iteration-10`, `perftestuser177-iteration-4`, `perftestuser42-iteration-15`.

**Final state:** 0 `perf-test-user-*`, 0 `perf-test-group-*`, 0 orphaned spaces. Only the
original demo users remain (admin, einstein, marie, katherine, richard, moss). oCIS is
running again as PID 40871, single instance on :9200.

> Note: oCIS is now running under *this session's* restart, not your original shell.
> Its log goes to `/tmp/ocis_restart2.log`. Restart it yourself if you want it back
> under your own terminal with your original env.

## Next steps

The single most useful change is **capturing oCIS logs** — the cause of the crash is
unknowable without them. Start it as:

```sh
ocis server 2>&1 | tee /tmp/ocis.log
```

Then, in order:

1. **Re-run and confirm reproducibility** at 300 VUs with logging on. If it dies again near
   ~236 VUs, that is a hard, reproducible ceiling worth filing.
2. **Bisect the ceiling** — this run only proves the server is healthy at ≤~200 VUs and dead
   at ~236. A run capped at 150 and one at 200 VUs would bracket it properly.
3. **Consider the co-location artifact** — k6 was consuming ~550% CPU on the same 11-core
   box as oCIS. Some of the collapse may be the load generator starving the server. A
   remote generator (or the Hetzner load-test servers in
   `~/Projects/ownCloud/OCISDEV-876 - load test servers in Hetzner`) would separate
   "oCIS cannot handle 300 VUs" from "this laptop cannot host both".
4. Note the seed is **not idempotent** — always run `_seeds-down-k6.js` before re-seeding, or
   every create conflicts.

## Reproducing

```sh
export ADMIN_LOGIN=admin ADMIN_PASSWORD=admin
export PLATFORM_BASE_URL=https://localhost:9200
export AUTH_N_PROVIDER_KOPANO_BASE_URL=https://localhost:9200
export AUTH_N_PROVIDER_KOPANO_REDIRECT_URL=https://localhost:9200/oidc-callback.html

k6 run -q packages/k6-tests/artifacts/_seeds-down-k6.js   # always clear first
export SEED_USERS_TOTAL=300
k6 run -q packages/k6-tests/artifacts/_seeds-up-k6.js

while read -r id vus sleep_after; do
  export TEST_KOKO_PLATFORM_${id}_RAMPING_STAGES_VUS=$vus
  export TEST_KOKO_PLATFORM_${id}_RAMPING_SLEEP_AFTER_ITERATION=$sleep_after
  export TEST_KOKO_PLATFORM_${id}_RAMPING_STAGES_UP_DURATION=5m
  export TEST_KOKO_PLATFORM_${id}_RAMPING_STAGES_PEAK_DURATION=15m
  export TEST_KOKO_PLATFORM_${id}_RAMPING_STAGES_DOWN_DURATION=2m
done <<'EOF'
020 40 10s
040 20 20s
050 20 15s
070 80 10s
080 20 10s
090 20 15s
100 20 15s
110 80 10s
EOF

export ENABLE_THRESHOLDS=true
export THRESHOLD_HTTP_REQ_FAILED="rate<0.02"
k6 run -q packages/k6-tests/artifacts/koko-platform-000-mixed-ramping-k6.js \
  --summary-mode=full --summary-export=/tmp/k6_summary.json \
  --tag testId=$(uuidgen) 2>&1 | tee /tmp/k6.log
echo "k6 exit: ${pipestatus[1]:-$?}"

k6 run -q packages/k6-tests/artifacts/_seeds-down-k6.js
```

Deviations from the instructions as given, and why:

- `$uuid` was unset in this shell, so `--tag testId=$uuid` would have tagged the run with an
  empty value; generated one with `uuidgen` and recorded it at the top of this report.
- Added `--summary-mode=full --summary-export=...` next to `-q`. `-q` only disables progress
  updates, so it does not conflict — but on its own it also suppresses the per-scenario
  breakdown, which would have meant a second 22-minute run to recover it.
- Ran `_seeds-down-k6.js` *before* test 1: the previous 20-user seed was still on the server
  and the seed script is not idempotent, so seeding 300 would have conflicted on every create.

### Artifacts

`/tmp/k6.log` (aborted run, ~1.04M lines) · `/tmp/k6_mixed300_summary.json` ·
`/tmp/k6_seed300.log` · `/tmp/k6_down300.log` · `/tmp/k6_health.log` (30s health probes) ·
`/tmp/ocis_restart2.log` (current server)
