import { Options } from 'k6/options'

import { login_010, options as inherited_options } from './simple.k6'

export const options: Options = {
  ...inherited_options,
  iterations: 10,
  duration: '7d',
  teardownTimeout: '1h'
}

export default login_010
