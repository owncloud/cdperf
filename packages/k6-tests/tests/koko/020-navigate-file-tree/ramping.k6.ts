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
      stages: [
        { target: 1000, duration: '20m' },
        { target: 1000, duration: '30m' },
        { target: 0, duration: '10m' }
      ]
    }
  }
}
