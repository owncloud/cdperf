import { Options } from 'k6/options'
import { omit } from 'lodash'

import { options as inherited_options } from './baseline.k6'

export { create_space_080 } from './simple.k6'

export const options: Options = {
  ...omit(inherited_options, 'iterations', 'duration'),
  scenarios: {
    create_space_080: {
      executor: 'ramping-vus',
      startVUs: 0,
      exec: 'create_space_080',
      env: {
        SLEEP_AFTER_ITERATION: '30s'
      },
      stages: [
        { target: 50, duration: '20m' },
        { target: 50, duration: '30m' },
        { target: 0, duration: '10m' }
      ]
    }
  }
}
