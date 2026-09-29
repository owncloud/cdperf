import { Options } from 'k6/options'

import { options as inherited_options, update_school_150 } from './simple.k6'

export { setup, teardown } from './simple.k6'

export const options: Options = {
  ...inherited_options,
  iterations: 10,
  duration: '7d'
}

export default update_school_150
