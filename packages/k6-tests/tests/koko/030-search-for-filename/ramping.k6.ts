import { Options } from 'k6/options'
import { omit } from 'lodash'

import { options as inherited_options } from './baseline.k6'

export { search_for_filename_030 } from './simple.k6'

export const options: Options = {
  ...omit(inherited_options, 'iterations', 'duration'),
  scenarios: {
    search_for_filename_030: {
      executor: 'ramping-vus',
      startVUs: 0,
      exec: 'search_for_filename_030',
      stages: [
        { target: 250, duration: '20m' },
        { target: 250, duration: '30m' },
        { target: 0, duration: '10m' }
      ]
    }
  }
}
