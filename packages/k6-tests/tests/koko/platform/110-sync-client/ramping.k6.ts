import { Options } from 'k6/options'
import { omit } from 'lodash'

import { options as inherited_options } from './baseline.k6'

export { sync_client_110 } from './simple.k6'

export const options: Options = {
  ...omit(inherited_options, 'iterations', 'duration'),
  scenarios: {
    sync_client_110: {
      executor: 'ramping-vus',
      startVUs: 0,
      exec: 'sync_client_110',
      env: {
        SLEEP_AFTER_ITERATION: '30s'
      },
      stages: [
        { target: 1000, duration: '20m' },
        { target: 1000, duration: '30m' },
        { target: 0, duration: '10m' }
      ]
    }
  }
}
