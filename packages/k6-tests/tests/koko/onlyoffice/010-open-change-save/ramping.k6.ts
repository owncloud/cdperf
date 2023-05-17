import { Options } from 'k6/options'
import { omit } from 'lodash'

import { options as inherited_options } from './baseline.k6'

export { open_change_save_010 } from './simple.k6'

export const options: Options = {
  ...omit(inherited_options, 'iterations', 'duration'),
  scenarios: {
    open_change_save_010: {
      executor: 'ramping-vus',
      startVUs: 0,
      exec: 'open_change_save_010',
      stages: [
        { target: 1000, duration: '20m' },
        { target: 1000, duration: '30m' },
        { target: 0, duration: '10m' }
      ]
    }
  }
}
