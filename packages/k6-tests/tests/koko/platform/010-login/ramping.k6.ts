import { ENV } from '@ownclouders/k6-tdk/lib/utils'
import { Options } from 'k6/options'
import { omit } from 'lodash'

import { options as inherited_options } from './baseline.k6'

export { login_010 } from './simple.k6'

export const options: Options = {
  ...omit(inherited_options, 'iterations', 'duration'),
  scenarios: {
    login_010: {
      executor: 'ramping-vus',
      startVUs: parseInt(ENV('TEST_KOKO_PLATFORM_010_RAMPING_STAGES_VUS', '30000'), 10),
      exec: 'login_010',
      gracefulStop: '120s',
      stages: [
        {
          target: parseInt(ENV('TEST_KOKO_PLATFORM_010_RAMPING_STAGES_VUS', '30000'), 10),
          duration: ENV('TEST_KOKO_PLATFORM_010_RAMPING_STAGES_UP_DURATION', '60m')
        }
      ]
    }
  }
}
