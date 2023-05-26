import { Options } from 'k6/options'
import { omit } from 'lodash'

import { options as inherited_options } from './baseline.k6'

export { login_010 } from './simple.k6'

export const options: Options = {
  ...omit(inherited_options, 'iterations', 'duration'),
  scenarios: {
    login_010: {
      executor: 'ramping-vus',
      startVUs: 30000,
      exec: 'login_010',
      gracefulStop: '120s',
      stages: [
        { target: 30000, duration: '60m' }
      ]
    }
  }
}
