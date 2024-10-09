import { ENV } from '@ownclouders/k6-tdk/lib/utils'
import { Options } from 'k6/options'
import { omit } from 'lodash'
import { envValues } from '@/values'

import { options as inherited_options } from './baseline.k6'

export { add_remove_tag_100 } from './simple.k6'

const settings = {
  ...envValues()
}

export const options: Options = {
  ...omit(inherited_options, 'iterations', 'duration'),
  scenarios: {
    add_remove_tag_100: {
      executor: 'ramping-vus',
      startVUs: 0,
      exec: 'add_remove_tag_100',
      env: {
        SLEEP_AFTER_ITERATION: ENV('TEST_KOKO_PLATFORM_100_RAMPING_SLEEP_AFTER_ITERATION', '60s')
      },
      stages: [
        {
          target: parseInt(ENV('TEST_KOKO_PLATFORM_100_RAMPING_STAGES_VUS', '250'), 10),
          duration: ENV('TEST_KOKO_PLATFORM_100_RAMPING_STAGES_UP_DURATION', '20m')
        },
        {
          target: parseInt(ENV('TEST_KOKO_PLATFORM_100_RAMPING_STAGES_VUS', '250'), 10),
          duration: ENV('TEST_KOKO_PLATFORM_100_RAMPING_STAGES_PEAK_DURATION', '30m')
        },
        {
          target: 0,
          duration: ENV('TEST_KOKO_PLATFORM_100_RAMPING_STAGES_DOWN_DURATION', '10m')
        }
      ],
      ...(settings.thresholds.enabled && {
        thresholds: {
          http_req_failed: [settings.thresholds.rate],
          http_req_duration: ENV('TEST_KOKO_PLATFORM_100_RAMPING_THRESHOLDS_DURATION', 'p(95)<300'),
        },
      })
    }
  }
}
