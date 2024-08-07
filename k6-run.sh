#!/bin/bash

if [ -z "$TEST_SERVER_URL" ]; then
    TEST_SERVER_URL=https://localhost:9200
fi

# ocis envs
export PLATFORM_BASE_URL="$TEST_SERVER_URL"
export AUTH_N_PROVIDER_KOPANO_BASE_URL="$TEST_SERVER_URL"
export AUTH_N_PROVIDER_KOPANO_REDIRECT_URL="$TEST_SERVER_URL"/oidc-callback.html



# create test-data
export SEED_USERS_TOTAL=1
k6 run packages/k6-tests/artifacts/_seeds-down-k6.js

# 090
export TEST_KOKO_PLATFORM_090_RAMPING_SLEEP_AFTER_ITERATION=1s
export TEST_KOKO_PLATFORM_090_RAMPING_STAGES_VUS=1
export TEST_KOKO_PLATFORM_090_RAMPING_STAGES_UP_DURATION=1s
export TEST_KOKO_PLATFORM_090_RAMPING_STAGES_PEAK_DURATION=5s
export TEST_KOKO_PLATFORM_090_RAMPING_STAGES_DOWN_DURATION=1s
# k6 run packages/k6-tests/artifacts/koko-platform-090-create-remove-group-share-ramping-k6.js --http-debug="full"


# k6 run packages/k6-tests/artifacts/oc-share-upload-rename-default-k6.js --http-debug="full"

