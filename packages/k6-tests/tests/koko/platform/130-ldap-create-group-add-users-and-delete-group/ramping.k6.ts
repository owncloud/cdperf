import { ENV } from '@ownclouders/k6-tdk/lib/utils'
import { Options } from 'k6/options'
import { omit } from 'lodash'

import { options as inherited_options } from './baseline.k6'

export { ldap_create_group_add_users_and_delete_group_130 } from './simple.k6'

export const options: Options = {
  ...omit(inherited_options, 'iterations', 'duration'),
  scenarios: {
    ldap_create_group_add_users_and_delete_group_130: {
      executor: 'ramping-vus',
      startVUs: 0,
      exec: 'ldap_create_group_add_users_and_delete_group_130',
      env: {
        SLEEP_AFTER_ITERATION: ENV('TEST_KOKO_PLATFORM_130_RAMPING_SLEEP_AFTER_ITERATION', '30s')
      },
      stages: [
        {
          target: parseInt(ENV('TEST_KOKO_PLATFORM_130_RAMPING_STAGES_VUS', '200'), 10),
          duration: ENV('TEST_KOKO_PLATFORM_130_RAMPING_STAGES_UP_DURATION', '20m')
        },
        {
          target: parseInt(ENV('TEST_KOKO_PLATFORM_130_RAMPING_STAGES_VUS', '200'), 10),
          duration: ENV('TEST_KOKO_PLATFORM_130_RAMPING_STAGES_PEAK_DURATION', '30m')
        },
        {
          target: 0,
          duration: ENV('TEST_KOKO_PLATFORM_130_RAMPING_STAGES_DOWN_DURATION', '10m')
        }
      ]
    }
  }
}
