# Description

The `140 provisioning new school` test mimics a school provisioning connector while it provisions a new school
through the oCIS education API (`/graph/v1.0/education`).
One iteration provisions one whole school: the school, its classes and its users, strictly in the order the connector uses.


## Procedure

* `setup` checks the options, a value that is not a number or out of range fails the run before the first school is created,
  and creates a run id, every school number is `LOADTEST-<run id>-<vu>-<iteration>`.
* each `iteration` creates a school (`POST /schools`), if this fails the rest of the school is skipped.
* each `iteration` creates the classes of the school, for each class:
  * `POST /classes`
  * `POST /schools/{schoolNumber}/classes/$ref`
* each `iteration` creates the users of the school, for each user:
  * `POST /users`, if this fails the links of this user are skipped
  * `POST /schools/{schoolNumber}/users/$ref`
  * for each class of the user: `GET /classes/{externalId}`, then `POST /classes/{id}/members/$ref`,
    teachers use `POST /classes/{id}/teachers/$ref` instead with `TEST_KOKO_PLATFORM_140_TEACHER_LINK=teachers`
* if cleanup is enabled, each `iteration` deletes its users and classes again (tagged `phase:cleanup`).
  The empty school stays, oCIS only deletes a school after its termination date has passed.

The users are a mix of

* staff (`TEST_KOKO_PLATFORM_140_STAFF_ROLE`) without a class (`TEST_KOKO_PLATFORM_140_NO_CLASS_SHARE`), 2 requests per user
* teachers (`lehrer`) in `TEST_KOKO_PLATFORM_140_TEACHER_CLASSES` classes (`TEST_KOKO_PLATFORM_140_TEACHER_SHARE`), 2 more requests per class
* students (`schueler`) in one class, everyone else, 4 requests per user

the test runs `N` times for each vu, for example if you define `--vus 2` and `--iterations 5`
the testing steps as a whole will run 10 times (5 times per vu), so 10 schools are provisioned.


## Entries vs. requests

The connector is measured in provisioning **entries** (a school, a class or a user), not http requests.
One entry needs 1 to 8 requests, a student needs 4. The summary shows both:

* `provisioning_entries` (tagged `type:school|class|user`), entries and entries/s
* `http_reqs`, requests and requests/s
* `http_req_duration{step:<step>}`, every request is tagged with its step
  (`create_school`, `create_class`, `link_class_to_school`, `create_user`, `link_user_to_school`, `get_class`,
  `link_user_to_class`, `link_teacher_to_class`)
* `provisioning_call_errors`, requests that did not return the expected status

Sizing: every request is followed by a pause of `SLEEP_AFTER_REQUEST` seconds (0.2 in the ramping test).
With about 50ms latency a student takes 4 × 0.25s ≈ 1s, so one vu provisions about **1 entry/s**
and a school with 1000 users takes about 17 minutes.

```
entries/s  ≈ vus × 1 / (4 × (SLEEP_AFTER_REQUEST + latency))
requests/s ≈ entries/s × 4
```

The ramping test runs 5 vus, which gives about 5 entries/s or about 20 requests/s.
It uses `ramping-vus` and not an arrival rate on purpose: one vu provisions one school at a time and a school takes minutes,
schools per minute as an arrival rate would start new schools faster than they finish.

What a ramping run leaves behind with the defaults (5 vus, 70 minutes, 1000 users and 30 classes per school):

* the ramping test sets `TEST_KOKO_PLATFORM_140_CLEANUP=true`, users and classes are deleted at the end of each school,
  the schools stay (roughly 20 to 25 schools)
* with `TEST_KOKO_PLATFORM_140_CLEANUP=false` roughly 24.000 users and 700 classes stay as well
* a school that is cut off by `gracefulStop` or a killed run keeps everything created so far


## Target system

* run against an integration system first, then pre-production. **Never run it against production.**
* if the target is only reachable through a proxy, k6 uses `HTTPS_PROXY`, e.g. `HTTPS_PROXY=http://<proxy-host>:<port>`.
* the test creates `LOADTEST-` schools that are not deleted, clean them up on the target system after the test.


## Compatibility

* :white_check_mark: ownCloud Infinite Scale with the education api enabled (LDAP backend)


## Available options

* [Shared options](/k6-tests/src/values/env), `ADMIN_LOGIN`, `ADMIN_PASSWORD`, `SLEEP_AFTER_REQUEST` and `SLEEP_AFTER_ITERATION` are used

| env | default | description |
|---|---|---|
| `PROVISIONING_BASE_URL` | `PLATFORM_BASE_URL` or `https://localhost:9200` | base url of the provisioning api |
| `PROVISIONING_TOKEN` | - | bearer token, if not set basic auth with `ADMIN_LOGIN` and `ADMIN_PASSWORD` is used |
| `TEST_KOKO_PLATFORM_140_USERS_PER_SCHOOL` | `1000` | users per school |
| `TEST_KOKO_PLATFORM_140_CLASSES_PER_SCHOOL` | `30` | classes per school |
| `TEST_KOKO_PLATFORM_140_TEACHER_SHARE` | `0.08` | share of teachers |
| `TEST_KOKO_PLATFORM_140_NO_CLASS_SHARE` | `0.02` | share of staff without a class |
| `TEST_KOKO_PLATFORM_140_TEACHER_CLASSES` | `3` | classes per teacher |
| `TEST_KOKO_PLATFORM_140_TEACHER_LINK` | `members` | `members`: teachers are class members like students, `teachers`: teachers are linked with `/classes/{id}/teachers/$ref` |
| `TEST_KOKO_PLATFORM_140_STAFF_ROLE` | `lehrer` | `primaryRole` of staff without a class |
| `TEST_KOKO_PLATFORM_140_CLEANUP` | `false`, ramping `true` | delete the users and classes at the end of each iteration |

ramping test only:

| env | default | description |
|---|---|---|
| `TEST_KOKO_PLATFORM_140_RAMPING_STAGES_VUS` | `5` | schools provisioned in parallel |
| `TEST_KOKO_PLATFORM_140_RAMPING_STAGES_UP_DURATION` | `5m` | ramp up |
| `TEST_KOKO_PLATFORM_140_RAMPING_STAGES_PEAK_DURATION` | `60m` | peak |
| `TEST_KOKO_PLATFORM_140_RAMPING_STAGES_DOWN_DURATION` | `5m` | ramp down |
| `TEST_KOKO_PLATFORM_140_RAMPING_GRACEFUL_STOP` | `30m` | time running schools get to finish (`gracefulRampDown` and `gracefulStop`) |
| `TEST_KOKO_PLATFORM_140_RAMPING_SLEEP_AFTER_REQUEST` | `0.2` | pause after each request |
| `TEST_KOKO_PLATFORM_140_RAMPING_THRESHOLDS_FAILED` | `rate<0.005` | `http_req_failed{phase:provision}` |
| `TEST_KOKO_PLATFORM_140_RAMPING_THRESHOLDS_CHECKS` | `rate>0.995` | `checks{phase:provision}` |
| `TEST_KOKO_PLATFORM_140_RAMPING_THRESHOLDS_ERRORS` | `count<10` | `provisioning_call_errors{phase:provision}` |
| `TEST_KOKO_PLATFORM_140_RAMPING_THRESHOLDS_DURATION` | `p(95)<800` | `http_req_duration{phase:provision}` |

the thresholds are only active with `ENABLE_THRESHOLDS=true`, they only count the provisioning, not the cleanup.


## How to run the test

please read [here](/k6-tests/docs/run) how the test can be executed, only the script is different.

the simple test runs one school without a time limit, with the defaults (1000 users, `SLEEP_AFTER_REQUEST=1`) this takes more than an hour.

a small school with 2 classes and 3 members each:

```shell
PROVISIONING_BASE_URL=https://<integration-host> \
PROVISIONING_TOKEN=<token> \
TEST_KOKO_PLATFORM_140_USERS_PER_SCHOOL=6 \
TEST_KOKO_PLATFORM_140_CLASSES_PER_SCHOOL=2 \
k6 run packages/k6-tests/artifacts/tests-koko-platform-140-provisioning-new-school-simple-k6.js
```
