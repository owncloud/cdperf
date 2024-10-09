import { ENV } from '@ownclouders/k6-tdk/lib/utils'
import { Options } from 'k6/options'
import { omit } from 'lodash'
import { envValues } from '@/values'

import { options as inherited_options } from './baseline.k6'

export { sync_client_110 } from './simple.k6'

const settings = {
  ...envValues()
}

export const options: Options = {
  ...omit(inherited_options, 'iterations', 'duration'),
  scenarios: {
    sync_client_110: {
      executor: 'ramping-vus',
      startVUs: 0,
      exec: 'sync_client_110',
      env: {
        SLEEP_AFTER_ITERATION: ENV('TEST_KOKO_PLATFORM_110_RAMPING_SLEEP_AFTER_ITERATION', '30s')
      },
      stages: [
        {
          target: parseInt(ENV('TEST_KOKO_PLATFORM_110_RAMPING_STAGES_VUS', '1000'), 10),
          duration: ENV('TEST_KOKO_PLATFORM_110_RAMPING_STAGES_UP_DURATION', '20m')
        },
        {
          target: parseInt(ENV('TEST_KOKO_PLATFORM_110_RAMPING_STAGES_VUS', '1000'), 10),
          duration: ENV('TEST_KOKO_PLATFORM_110_RAMPING_STAGES_PEAK_DURATION', '30m')
        },
        {
          target: 0,
          duration: ENV('TEST_KOKO_PLATFORM_110_RAMPING_STAGES_DOWN_DURATION', '10m')
        }
      ]
    }
  },
  ...(settings.thresholds.enabled && {
    thresholds: {
      http_req_failed: [settings.thresholds.rate],
      http_req_duration: [ENV('TEST_KOKO_PLATFORM_110_RAMPING_THRESHOLDS_DURATION', 'p(95)<300')],
    }
  })
}
