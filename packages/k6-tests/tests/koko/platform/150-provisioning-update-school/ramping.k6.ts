import { ENV } from '@ownclouders/k6-tdk/lib/utils'
import { Options, Scenario } from 'k6/options'
import { omit } from 'lodash'

import { intFrom, perMinute } from '@/provisioning'
import { envValues } from '@/values'

import { options as inherited_options } from './baseline.k6'

export {
  bulk_class_membership_150,
  change_class_membership_150,
  rename_class_150,
  setup,
  teardown,
  update_user_account_enabled_150,
  update_user_attribute_150
} from './simple.k6'

const settings = {
  ...envValues()
}

// every update type is its own scenario with its own rate (updates per second), the default rates add up to 5 updates per second
const scenario = (name: string, rate: string, vus: string): Scenario => {
  const key = name.toUpperCase()
  const target = perMinute(ENV(`TEST_KOKO_PLATFORM_150_RAMPING_${key}_RATE`, rate))
  const preAllocatedVUsName = `TEST_KOKO_PLATFORM_150_RAMPING_${key}_PRE_ALLOCATED_VUS`
  const preAllocatedVUs = intFrom({ name: preAllocatedVUsName, value: ENV(preAllocatedVUsName, vus), min: 1 })
  const maxVUsName = `TEST_KOKO_PLATFORM_150_RAMPING_${key}_MAX_VUS`

  return {
    executor: 'ramping-arrival-rate',
    exec: name,
    startRate: 0,
    timeUnit: '1m',
    preAllocatedVUs,
    maxVUs: intFrom({ name: maxVUsName, value: ENV(maxVUsName, String(preAllocatedVUs * 4)), min: preAllocatedVUs }),
    env: {
      SLEEP_AFTER_REQUEST: ENV('TEST_KOKO_PLATFORM_150_RAMPING_SLEEP_AFTER_REQUEST', '0.2')
    },
    stages: [
      {
        target,
        duration: ENV('TEST_KOKO_PLATFORM_150_RAMPING_STAGES_UP_DURATION', '5m')
      },
      {
        target,
        duration: ENV('TEST_KOKO_PLATFORM_150_RAMPING_STAGES_PEAK_DURATION', '20m')
      },
      {
        target: 0,
        duration: ENV('TEST_KOKO_PLATFORM_150_RAMPING_STAGES_DOWN_DURATION', '5m')
      }
    ]
  }
}

const scenarios: Record<string, Scenario> = {
  update_user_attribute_150: scenario('update_user_attribute_150', '2', '5'),
  update_user_account_enabled_150: scenario('update_user_account_enabled_150', '1', '5'),
  rename_class_150: scenario('rename_class_150', '1', '5'),
  change_class_membership_150: scenario('change_class_membership_150', '1', '5'),
  ...(ENV('TEST_KOKO_PLATFORM_150_BULK_ENABLED', 'false') === 'true' && {
    bulk_class_membership_150: scenario('bulk_class_membership_150', '1', '10')
  })
}

export const options: Options = {
  ...omit(inherited_options, 'iterations', 'duration'),
  scenarios,
  ...(settings.thresholds.enabled && {
    thresholds: {
      // k6 drops iterations instead of slowing down once maxVUs are busy, without this threshold
      // a run passes while it never delivered the target rate, which is what this test is about
      dropped_iterations: [ENV('TEST_KOKO_PLATFORM_150_RAMPING_THRESHOLDS_DROPPED', 'count<10')],
      // setup, teardown and the bulk preparation are not part of the result
      'http_req_failed{phase:provision}': [ENV('TEST_KOKO_PLATFORM_150_RAMPING_THRESHOLDS_FAILED', 'rate<0.005')],
      'checks{phase:provision}': [ENV('TEST_KOKO_PLATFORM_150_RAMPING_THRESHOLDS_CHECKS', 'rate>0.995')],
      'provisioning_call_errors{phase:provision}': [ENV('TEST_KOKO_PLATFORM_150_RAMPING_THRESHOLDS_ERRORS', 'count<10')],
      'http_req_duration{phase:provision}': [ENV('TEST_KOKO_PLATFORM_150_RAMPING_THRESHOLDS_DURATION', 'p(95)<800')],
      ...Object.keys(scenarios).reduce((acc, name) => {
        return {
          ...acc,
          [`http_req_duration{scenario:${name},phase:provision}`]: [ENV('TEST_KOKO_PLATFORM_150_RAMPING_THRESHOLDS_DURATION', 'p(95)<800')]
        }
      }, {})
    }
  })
}
