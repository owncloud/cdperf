import { Options } from 'k6/options'
import { omit } from 'lodash'

import { options as inherited_options } from './baseline.k6'

export { add_remove_tag_100 } from './simple.k6'

export const options: Options = {
  ...omit(inherited_options, 'iterations', 'duration'),
  scenarios: {
    add_remove_tag_100: {
      executor: 'ramping-vus',
      startVUs: 0,
      exec: 'add_remove_tag_100',
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
