#!/bin/bash

if [ -z "$TEST_SERVER_URL" ]; then
    TEST_SERVER_URL=https://ocis-server:9200
fi

# ocis envs
export PLATFORM_BASE_URL="$TEST_SERVER_URL"
export AUTH_N_PROVIDER_KOPANO_BASE_URL="$TEST_SERVER_URL"
export AUTH_N_PROVIDER_KOPANO_REDIRECT_URL="$TEST_SERVER_URL"/oidc-callback.html

# create test-data
export SEED_USERS_TOTAL=30

# for testing ocis v6 - next branch in cdperf 
script="packages/k6-tests/artifacts/src-seeds-up-k6.js"

# k6 run packages/k6-tests/artifacts/src-seeds-up-k6.js


# 020
export TEST_KOKO_PLATFORM_020_RAMPING_SLEEP_AFTER_ITERATION=1s
export TEST_KOKO_PLATFORM_020_RAMPING_STAGES_VUS=1
export TEST_KOKO_PLATFORM_020_RAMPING_STAGES_UP_DURATION=1s
export TEST_KOKO_PLATFORM_020_RAMPING_STAGES_PEAK_DURATION=1m
export TEST_KOKO_PLATFORM_020_RAMPING_STAGES_DOWN_DURATION=2s

# 040
export TEST_KOKO_PLATFORM_040_RAMPING_SLEEP_AFTER_ITERATION=2s
export TEST_KOKO_PLATFORM_040_RAMPING_STAGES_VUS=1
export TEST_KOKO_PLATFORM_040_RAMPING_STAGES_UP_DURATION=5s
export TEST_KOKO_PLATFORM_040_RAMPING_STAGES_PEAK_DURATION=1m
export TEST_KOKO_PLATFORM_040_RAMPING_STAGES_DOWN_DURATION=5s

# 050
export TEST_KOKO_PLATFORM_050_RAMPING_SLEEP_AFTER_ITERATION=1s
export TEST_KOKO_PLATFORM_050_RAMPING_STAGES_VUS=10
export TEST_KOKO_PLATFORM_050_RAMPING_STAGES_UP_DURATION=5s
export TEST_KOKO_PLATFORM_050_RAMPING_STAGES_PEAK_DURATION=1m
export TEST_KOKO_PLATFORM_050_RAMPING_STAGES_DOWN_DURATION=2s

# 070
export TEST_KOKO_PLATFORM_070_RAMPING_SLEEP_AFTER_ITERATION=1s
export TEST_KOKO_PLATFORM_070_RAMPING_STAGES_VUS=1
export TEST_KOKO_PLATFORM_070_RAMPING_STAGES_UP_DURATION=5s
export TEST_KOKO_PLATFORM_070_RAMPING_STAGES_PEAK_DURATION=1m
export TEST_KOKO_PLATFORM_070_RAMPING_STAGES_DOWN_DURATION=2s

# 080
export TEST_KOKO_PLATFORM_080_RAMPING_SLEEP_AFTER_ITERATION=1s
export TEST_KOKO_PLATFORM_080_RAMPING_STAGES_VUS=1
export TEST_KOKO_PLATFORM_080_RAMPING_STAGES_UP_DURATION=5s
export TEST_KOKO_PLATFORM_080_RAMPING_STAGES_PEAK_DURATION=1m
export TEST_KOKO_PLATFORM_080_RAMPING_STAGES_DOWN_DURATION=2s

# 090
export TEST_KOKO_PLATFORM_090_RAMPING_SLEEP_AFTER_ITERATION=1s
export TEST_KOKO_PLATFORM_090_RAMPING_STAGES_VUS=1
export TEST_KOKO_PLATFORM_090_RAMPING_STAGES_UP_DURATION=5s
export TEST_KOKO_PLATFORM_090_RAMPING_STAGES_PEAK_DURATION=1m
export TEST_KOKO_PLATFORM_090_RAMPING_STAGES_DOWN_DURATION=2s

# 100
export TEST_KOKO_PLATFORM_100_RAMPING_SLEEP_AFTER_ITERATION=1s
export TEST_KOKO_PLATFORM_100_RAMPING_STAGES_VUS=1
export TEST_KOKO_PLATFORM_100_RAMPING_STAGES_UP_DURATION=5s
export TEST_KOKO_PLATFORM_100_RAMPING_STAGES_PEAK_DURATION=1m
export TEST_KOKO_PLATFORM_100_RAMPING_STAGES_DOWN_DURATION=2s

# 110
export TEST_KOKO_PLATFORM_110_RAMPING_SLEEP_AFTER_ITERATION=1s
export TEST_KOKO_PLATFORM_110_RAMPING_STAGES_VUS=1
export TEST_KOKO_PLATFORM_110_RAMPING_STAGES_UP_DURATION=5s
export TEST_KOKO_PLATFORM_110_RAMPING_STAGES_PEAK_DURATION=1m
export TEST_KOKO_PLATFORM_110_RAMPING_STAGES_DOWN_DURATION=2s

# export ENABLE_THRESHOLDS=true



k6 run packages/k6-tests/artifacts/tests-koko-platform-000-mixed-ramping-k6.js
# k6 run packages/k6-tests/artifacts/tests-koko-platform-020-navigate-file-tree-ramping-k6.js
# k6 run packages/k6-tests/artifacts/tests-koko-platform-050-download-ramping-k6.js

exit_code=$?

if [ $exit_code -ne 0 ]; then
  echo "K6 test failed with an error"
  exit 1  # CI shows failure
else
  echo "K6 test successful"
fi