import { Options } from 'k6/options'
import { omit } from 'lodash'

import { options as inherited_options } from './baseline.k6'

export { user_group_search_070 } from './simple.k6'

export const options: Options = {
  ...omit(inherited_options, 'iterations', 'duration'),
  scenarios: {
    user_group_search_070: {
      executor: 'ramping-vus',
      startVUs: 0,
      exec: 'user_group_search_070',
      env: {
        SLEEP_AFTER_ITERATION: '30s'
      },
      stages: [
        { target: 200, duration: '20m' },
        { target: 200, duration: '30m' },
        { target: 0, duration: '10m' }
      ]
    }
  }
}
