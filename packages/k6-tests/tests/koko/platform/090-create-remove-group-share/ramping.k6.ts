import { Options } from 'k6/options'
import { omit } from 'lodash'

import { options as inherited_options } from './baseline.k6'

export { create_remove_group_share_090 } from './simple.k6'

export const options: Options = {
  ...omit(inherited_options, 'iterations', 'duration'),
  scenarios: {
    create_remove_group_share_090: {
      executor: 'ramping-vus',
      startVUs: 0,
      exec: 'create_remove_group_share_090',
      env: {
        SLEEP_AFTER_ITERATION: '60s'
      },
      stages: [
        { target: 250, duration: '20m' },
        { target: 250, duration: '30m' },
        { target: 0, duration: '10m' }
      ]
    }
  }
}
