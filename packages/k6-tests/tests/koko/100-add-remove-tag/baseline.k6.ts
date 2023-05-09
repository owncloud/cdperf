import { Options } from 'k6/options'

import { add_remove_tag_100, options as inherited_options } from './simple.k6'

export const options: Options = {
  ...inherited_options,
  iterations: 10,
  duration: '7d',
  teardownTimeout: '1h'
}

export default add_remove_tag_100
