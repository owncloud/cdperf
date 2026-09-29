# Description

The `150 provisioning update school` test mimics a school provisioning connector while it updates an existing school
through the oCIS education API (`/graph/v1.0/education`).
Every update type is its own scenario, over time every user, class and membership of the school gets updated.


## Procedure

* `setup` reads the users and classes of the reference school (`TEST_KOKO_PLATFORM_150_REFERENCE_SCHOOL`) and the members of each class,
  it fails if the school is not set, cannot be read or has no users or classes, and with bulk enabled if it has less than 2 classes.
* each iteration picks its user, class or membership round-robin:

| scenario | request(s) |
|---|---|
| `update_user_attribute_150` | `PATCH /users/{id}` with `givenName` and `surname` |
| `update_user_account_enabled_150` | `PATCH /users/{id}` with `accountEnabled`, the first pass over all users disables them, the next enables them again |
| `rename_class_150` | `PATCH /classes/{id}` with `displayName`, expects `204` (see below) |
| `change_class_membership_150` | `DELETE /classes/{id}/members/{userId}/$ref`, then `POST /classes/{id}/members/$ref`, the membership is the same afterwards |
| `bulk_class_membership_150` | only with `TEST_KOKO_PLATFORM_150_BULK_ENABLED=true`, removes up to `TEST_KOKO_PLATFORM_150_BULK_SIZE` members one by one (tagged `phase:prepare`), then adds them again with one `PATCH /classes/{id}` with `members@odata.bind` |

* with bulk enabled, every second class is used by `bulk_class_membership_150` only, the others by `change_class_membership_150` only,
  so both never change the same membership at the same time.
* `teardown` adds the class members read in `setup` again, in `PATCH` requests of up to `TEST_KOKO_PLATFORM_150_BULK_SIZE` members,
  so memberships lost in a failed membership update come back (`TEST_KOKO_PLATFORM_150_TEARDOWN_RESTORE_MEMBERSHIPS`),
  and enables every user of the school again (`TEST_KOKO_PLATFORM_150_TEARDOWN_ENABLE_USERS`).
  Names and class names keep their last value. A run that is killed does not run `teardown`, the next complete run only restores what its own `setup` found.

the simple and baseline tests run every update type once per iteration.
The ramping test uses `ramping-arrival-rate`, the rates are updates per second (fractions like `0.5` are allowed), the default rates add up to 5 updates/s.

`provisioning_entries{type:update}` counts the updated entries: 1 per `PATCH` and 2 per membership change,
`provisioning_entries{type:bulk}` counts 1 per member in a bulk `PATCH`.

oCIS answers `PATCH /classes/{id}` with `204` today, the handler carries a TODO to answer `200` with the class unless `prefer=minimal` is sent.
If that changes, every rename fails its check and the expected status in the test has to follow.


## Bulk membership: run it on its own

Keep `TEST_KOKO_PLATFORM_150_BULK_ENABLED=true` for a separate comparison run, do not mix it into the regular run:

* at the default rate of 1/s bulk sends about 21 requests/s, 20 of them are the `DELETE`s that prepare the batch.
  They are tagged `phase:prepare` and are not part of any threshold, that is more hidden load than the rest of the test (about 6 requests/s).
* one bulk `PATCH` counts 20 entries, the entries/s of a mixed run jump from about 5 to about 26.
* 21 requests have to fit into the 1s arrival window, over a slow or proxied link they will not,
  iterations pile up and are dropped, which fails the `dropped_iterations` threshold.

A standalone bulk run sets the other rates to `0`:

```shell
TEST_KOKO_PLATFORM_150_BULK_ENABLED=true \
TEST_KOKO_PLATFORM_150_RAMPING_UPDATE_USER_ATTRIBUTE_150_RATE=0 \
TEST_KOKO_PLATFORM_150_RAMPING_UPDATE_USER_ACCOUNT_ENABLED_150_RATE=0 \
TEST_KOKO_PLATFORM_150_RAMPING_RENAME_CLASS_150_RATE=0 \
TEST_KOKO_PLATFORM_150_RAMPING_CHANGE_CLASS_MEMBERSHIP_150_RATE=0 \
...
```


## Seed a reference school

run test 140 once with a small school and without cleanup, it logs the school number (`provisioning school LOADTEST-<run id>-1-0`),
the schools can also be listed with `GET /graph/v1.0/education/schools`:

```shell
TEST_KOKO_PLATFORM_140_USERS_PER_SCHOOL=100 \
TEST_KOKO_PLATFORM_140_CLASSES_PER_SCHOOL=4 \
k6 run packages/k6-tests/artifacts/tests-koko-platform-140-provisioning-new-school-simple-k6.js
```


## Target system

* run against an integration system first, then pre-production. **Never run it against production.**
* if the target is only reachable through a proxy, k6 uses `HTTPS_PROXY`, e.g. `HTTPS_PROXY=http://<proxy-host>:<port>`.
* only use a `LOADTEST-` school as reference school, the test changes names, disables users and changes memberships.


## Compatibility

* :white_check_mark: ownCloud Infinite Scale with the education api enabled (LDAP backend)


## Available options

* [Shared options](/k6-tests/src/values/env), `ADMIN_LOGIN`, `ADMIN_PASSWORD` and `SLEEP_AFTER_REQUEST` are used

| env | default | description |
|---|---|---|
| `PROVISIONING_BASE_URL` | `PLATFORM_BASE_URL` or `https://localhost:9200` | base url of the provisioning api |
| `PROVISIONING_TOKEN` | - | bearer token, if not set basic auth with `ADMIN_LOGIN` and `ADMIN_PASSWORD` is used |
| `TEST_KOKO_PLATFORM_150_REFERENCE_SCHOOL` | - | **required**, id or school number of the school to update |
| `TEST_KOKO_PLATFORM_150_BULK_ENABLED` | `false` | enable `bulk_class_membership_150` |
| `TEST_KOKO_PLATFORM_150_BULK_SIZE` | `20` | members per bulk `PATCH`, 1 to 20, oCIS allows at most 20 |
| `TEST_KOKO_PLATFORM_150_TEARDOWN_RESTORE_MEMBERSHIPS` | `true` | add the class members read in `setup` again in `teardown` |
| `TEST_KOKO_PLATFORM_150_TEARDOWN_ENABLE_USERS` | `true` | enable all users in `teardown` |
| `TEST_KOKO_PLATFORM_150_SETUP_TIMEOUT` | `10m` | `setupTimeout`, `setup` reads the members of every class |
| `TEST_KOKO_PLATFORM_150_TEARDOWN_TIMEOUT` | `30m` | `teardownTimeout`, `teardown` sends about 1 request per user and 1 per 20 members, unpaced, a school with 1000 users takes about 5 minutes at 300ms per request |

ramping test only, `<SCENARIO>` is the upper case scenario name, e.g. `UPDATE_USER_ATTRIBUTE_150`:

| env | default | description |
|---|---|---|
| `TEST_KOKO_PLATFORM_150_RAMPING_<SCENARIO>_RATE` | `2` user attribute, `1` others | updates per second at peak |
| `TEST_KOKO_PLATFORM_150_RAMPING_<SCENARIO>_PRE_ALLOCATED_VUS` | `5`, bulk `10` | pre allocated vus |
| `TEST_KOKO_PLATFORM_150_RAMPING_<SCENARIO>_MAX_VUS` | 4 × pre allocated vus | max vus |
| `TEST_KOKO_PLATFORM_150_RAMPING_STAGES_UP_DURATION` | `5m` | ramp up |
| `TEST_KOKO_PLATFORM_150_RAMPING_STAGES_PEAK_DURATION` | `20m` | peak |
| `TEST_KOKO_PLATFORM_150_RAMPING_STAGES_DOWN_DURATION` | `5m` | ramp down |
| `TEST_KOKO_PLATFORM_150_RAMPING_SLEEP_AFTER_REQUEST` | `0.2` | pause after each request |
| `TEST_KOKO_PLATFORM_150_RAMPING_THRESHOLDS_DROPPED` | `count<10` | `dropped_iterations`, iterations k6 could not start because all vus were busy, the target rate was not delivered |
| `TEST_KOKO_PLATFORM_150_RAMPING_THRESHOLDS_FAILED` | `rate<0.005` | `http_req_failed{phase:provision}` |
| `TEST_KOKO_PLATFORM_150_RAMPING_THRESHOLDS_CHECKS` | `rate>0.995` | `checks{phase:provision}` |
| `TEST_KOKO_PLATFORM_150_RAMPING_THRESHOLDS_ERRORS` | `count<10` | `provisioning_call_errors{phase:provision}` |
| `TEST_KOKO_PLATFORM_150_RAMPING_THRESHOLDS_DURATION` | `p(95)<800` | `http_req_duration{phase:provision}`, overall and per scenario |

the thresholds are only active with `ENABLE_THRESHOLDS=true`, they only count the updates, not `setup`, `teardown` or the bulk preparation.


## How to run the test

please read [here](/k6-tests/docs/run) how the test can be executed, only the script is different.

```shell
PROVISIONING_BASE_URL=https://<integration-host> \
PROVISIONING_TOKEN=<token> \
TEST_KOKO_PLATFORM_150_REFERENCE_SCHOOL=LOADTEST-1700000000000-1-0 \
k6 run packages/k6-tests/artifacts/tests-koko-platform-150-provisioning-update-school-ramping-k6.js
```
