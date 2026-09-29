import { ENV } from '@ownclouders/k6-tdk/lib/utils'
import { Options } from 'k6/options'
import { omit } from 'lodash'

import { intFrom } from '@/provisioning'
import { envValues } from '@/values'

import { options as inherited_options } from './baseline.k6'

export { provision_new_school_140, setup } from './simple.k6'

const settings = {
  ...envValues()
}

const vus = intFrom({ name: 'TEST_KOKO_PLATFORM_140_RAMPING_STAGES_VUS', value: ENV('TEST_KOKO_PLATFORM_140_RAMPING_STAGES_VUS', '5'), min: 1 })

export const options: Options = {
  ...omit(inherited_options, 'iterations', 'duration'),
  scenarios: {
    // ramping-vus and not an arrival rate: one vu provisions one school at a time and a school takes 17+ minutes,
    // an arrival rate in schools per minute would start new schools faster than they finish and pile up vus
    provision_new_school_140: {
      executor: 'ramping-vus',
      startVUs: 0,
      exec: 'provision_new_school_140',
      env: {
        SLEEP_AFTER_REQUEST: ENV('TEST_KOKO_PLATFORM_140_RAMPING_SLEEP_AFTER_REQUEST', '0.2'),
        // a full run creates about 24.000 users and 700 classes, remove them unless they are needed afterwards
        TEST_KOKO_PLATFORM_140_CLEANUP: ENV('TEST_KOKO_PLATFORM_140_CLEANUP', 'true')
      },
      // one vu provisions one school at a time, the number of vus is the number of schools provisioned in parallel
      stages: [
        {
          target: vus,
          duration: ENV('TEST_KOKO_PLATFORM_140_RAMPING_STAGES_UP_DURATION', '5m')
        },
        {
          target: vus,
          duration: ENV('TEST_KOKO_PLATFORM_140_RAMPING_STAGES_PEAK_DURATION', '60m')
        },
        {
          target: 0,
          duration: ENV('TEST_KOKO_PLATFORM_140_RAMPING_STAGES_DOWN_DURATION', '5m')
        }
      ],
      // a school takes minutes, give running schools time to finish instead of cutting them off halfway
      gracefulRampDown: ENV('TEST_KOKO_PLATFORM_140_RAMPING_GRACEFUL_STOP', '30m'),
      gracefulStop: ENV('TEST_KOKO_PLATFORM_140_RAMPING_GRACEFUL_STOP', '30m')
    }
  },
  ...(settings.thresholds.enabled && {
    thresholds: {
      // cleanup requests are not part of the result
      'http_req_failed{phase:provision}': [ENV('TEST_KOKO_PLATFORM_140_RAMPING_THRESHOLDS_FAILED', 'rate<0.005')],
      'checks{phase:provision}': [ENV('TEST_KOKO_PLATFORM_140_RAMPING_THRESHOLDS_CHECKS', 'rate>0.995')],
      'provisioning_call_errors{phase:provision}': [ENV('TEST_KOKO_PLATFORM_140_RAMPING_THRESHOLDS_ERRORS', 'count<10')],
      'http_req_duration{phase:provision}': [ENV('TEST_KOKO_PLATFORM_140_RAMPING_THRESHOLDS_DURATION', 'p(95)<800')]
    }
  })
}
