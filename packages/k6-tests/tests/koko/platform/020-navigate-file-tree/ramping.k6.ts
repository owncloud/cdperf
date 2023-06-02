import { ENV } from '@ownclouders/k6-tdk/lib/utils'
import { Options } from 'k6/options'
import { omit } from 'lodash'

import { options as inherited_options } from './baseline.k6'

export { navigate_file_tree_020 } from './simple.k6'

export const options: Options = {
  ...omit(inherited_options, 'iterations', 'duration'),
  scenarios: {
    navigate_file_tree_020: {
      executor: 'ramping-vus',
      startVUs: 0,
      exec: 'navigate_file_tree_020',
      env: {
        SLEEP_AFTER_ITERATION: ENV('TEST_KOKO_PLATFORM_020_RAMPING_SLEEP_AFTER_ITERATION', '2s')
      },
      stages: [
        {
          target: parseInt(ENV('TEST_KOKO_PLATFORM_020_RAMPING_STAGES_VUS', '1000'), 10),
          duration: ENV('TEST_KOKO_PLATFORM_020_RAMPING_STAGES_UP_DURATION', '20m')
        },
        {
          target: parseInt(ENV('TEST_KOKO_PLATFORM_020_RAMPING_STAGES_VUS', '1000'), 10),
          duration: ENV('TEST_KOKO_PLATFORM_020_RAMPING_STAGES_PEAK_DURATION', '30m')
        },
        {
          target: 0,
          duration: ENV('TEST_KOKO_PLATFORM_020_RAMPING_STAGES_DOWN_DURATION', '10m')
        }
      ]
    }
  }
}
