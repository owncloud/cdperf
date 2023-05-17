import { Options } from 'k6/options'
import { omit } from 'lodash'

import { options as inherited_options } from './baseline.k6'

export { download_050 } from './simple.k6'

export const options: Options = {
  ...omit(inherited_options, 'iterations', 'duration'),
  scenarios: {
    download_050: {
      executor: 'ramping-vus',
      startVUs: 0,
      exec: 'download_050',
      stages: [
        { target: 500, duration: '20m' },
        { target: 500, duration: '30m' },
        { target: 0, duration: '10m' }
      ]
    }
  }
}
